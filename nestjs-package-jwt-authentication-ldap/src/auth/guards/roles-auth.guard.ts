import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // get roles from metaData ex `'C3Administrator', 'C3Student'`
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }
    // get jwt injected user from request
    const user = request.user;
    // check if user have guard required role
    // Logger.log(`roles: ${JSON.stringify(roles)}, user.roles: ${JSON.stringify(user.roles)}`, RolesAuthGuard.name);
    return this.matchRoles(roles, user.roles);
  }

  matchRoles(roles: string[], userRoles: string[]): boolean {
    let result = false;
    roles.forEach((e) => {
      if (userRoles.includes(e)) {
        result = true;
      }
    });
    return result;
  }
}
