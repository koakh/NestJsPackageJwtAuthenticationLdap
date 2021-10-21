import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // get method scoped permissions from metaData ex `'RP_CLASSES', 'RP_CLASSES@READ'` 
    let permissions = this.reflector.get<string[]>('permissions', context.getHandler());
    // if doesn't have method scoped metadata, we need to verify the class scope
    if (!permissions) {
      // get class scoped permissions from metaData ex `'RP_CLASSES', 'RP_CLASSES@READ'` 
      permissions = this.reflector.get<string[]>('permissions', context.getClass());
      if (!permissions) {
        return true;
      }
    }
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }
    // get jwt injected user from request
    const user = request.user;
    // check if user have guard required permission
    // Logger.log(`permissions: ${JSON.stringify(permissions)}, user.permissions: ${JSON.stringify(user.permissions)}`, PermissionsAuthGuard.name);
    return this.matchPermissions(permissions, user.permissions);
  }

  matchPermissions(permissions: string[], userPermissions: string[]): boolean {
    let result = false;
    permissions.forEach((e) => {
      if (userPermissions.includes(e)) {
        result = true;
      }
    });
    return result;
  }
}
