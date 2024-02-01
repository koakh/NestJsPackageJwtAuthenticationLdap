import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { ModuleOptionsConfig } from '../../../common/interfaces';
import { CONFIG_SERVICE } from '../../../common/constants';

// this guard is to prevent delete the user LDAP_ROOT_USER

@Injectable()
export class LdapDeleteUsersGuard implements CanActivate {
  constructor(
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }

    // protect delete user if is the root user or current logged user
    return request.body.cn != this.config.ldap.rootUser && request.body.cn != request.user.username;
  }
}