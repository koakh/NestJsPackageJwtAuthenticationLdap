import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from '../enums';

@Injectable()
export class PermissionsAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // get permissions from metaData ex `'RP_CLASSES', 'RP_CLASSES@READ'`
    const permissions = this.reflector.get<string[]>('permissions', context.getHandler());
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }
    // get jwt injected user from request
    const user = request.user;

    // if guard don't have permissions or roles
    if (!permissions && !roles) {
      return true;
    }
    // check if user have guard required permission or have required role (we use only at a time, normally we dont user both)
    const haveRole = this.matchRoles(roles, user.roles);
    const havePermission = this.matchPermissions(permissions, user.permissions);
    return haveRole || havePermission;
  }

  matchRoles(roles: string[], userRoles: string[]): boolean {
    let result = false;
    if (!roles) {
      return result;
    }
    roles.forEach((e) => {
      // require to check environment ROLE_ADMIN alias too
      if (userRoles.includes(e) || (e === UserRoles.ROLE_ADMIN && process.env.AUTH_ADMIN_ROLE && userRoles.includes(process.env.AUTH_ADMIN_ROLE))) {
        result = true;
      }
    });
    return result;
  }

  matchPermissions(permissions: string[], userPermissions: string[]): boolean {
    let result = false;
    if (!permissions) {
      return result;
    }
    permissions.forEach((e) => {
      if (userPermissions.includes(e)) {
        result = true;
      }
    });
    return result;
  }
}
