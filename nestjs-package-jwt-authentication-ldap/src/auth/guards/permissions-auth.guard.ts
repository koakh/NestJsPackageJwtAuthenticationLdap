import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from '../enums';

@Injectable()
export class PermissionsAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user is present, unauthorized
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // If no specific permissions or roles are required, allow access
    if (!permissions && !roles) {
      return true;
    }

    // Check if user has required roles or permissions
    const hasRole = this.checkRoles(roles, user.roles);
    const hasPermission = this.checkPermissions(permissions, user.permissions);

    return hasRole || hasPermission;
  }

  private checkRoles(requiredRoles: string[], userRoles: string[]): boolean {
    if (!requiredRoles?.length) {
      return false;
    }

    return requiredRoles.some(role =>
      userRoles.includes(role) ||
      (role === UserRoles.ROLE_ADMIN &&
       process.env.AUTH_ADMIN_ROLE &&
       userRoles.includes(process.env.AUTH_ADMIN_ROLE)),
    );
  }

  private checkPermissions(requiredPermissions: string[], userPermissions: string[]): boolean {
    if (!requiredPermissions?.length) {
      return false;
    }

    return requiredPermissions.some(permission =>
      userPermissions.includes(permission),
    );
  }
}
