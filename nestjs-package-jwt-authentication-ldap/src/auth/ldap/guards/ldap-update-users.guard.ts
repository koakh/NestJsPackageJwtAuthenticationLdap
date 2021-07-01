import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { envConstants as e } from '../../common/constants/env';

@Injectable()
export class LdapUpdateUsersGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }

    const username: string = request.body.username ? request.body.username : request.user.username;
    const selfChange: boolean = username==request.user.username;

    if (selfChange)
    {
      if (request.body.changes)
      {
        request.body.changes=request.body.changes.reduce((acu,item) => {
          const keys=Object.keys(item.modification);
          if (keys.length && keys[0].toLowerCase()!='useraccountcontrol')
            acu.push(item);
          return acu;
        },[]);
      }
    }

    return request.user.username==this.configService.get(e.LDAP_ROOT_USER) || selfChange;
  }
}