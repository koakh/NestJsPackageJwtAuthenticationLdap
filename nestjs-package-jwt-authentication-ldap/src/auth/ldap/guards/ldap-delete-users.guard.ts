import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { envConstants as e } from '../../../common/constants/env';

@Injectable()
export class LdapDeleteUsersGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }

    return request.body.username!=this.configService.get(e.LDAP_ROOT_USER) && request.body.username!=request.user.username;
  }
}