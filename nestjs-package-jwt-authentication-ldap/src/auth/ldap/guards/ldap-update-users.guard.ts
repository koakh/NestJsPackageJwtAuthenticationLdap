import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { ModuleOptionsConfig } from '../../../common/interfaces';
import { CONFIG_SERVICE } from '../../../common/constants';

// this guard is to prevent update the user LDAP_ROOT_USER ex change its name from c3 to other

@Injectable()
export class LdapUpdateUsersGuard implements CanActivate {
  constructor(
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }

    const username: string = request.body.cn ? request.body.cn : request.user.cn;
    const selfChange: boolean = username == request.user.username;

    if (selfChange) {
      if (request.body.changes) {
        request.body.changes = request.body.changes.reduce((acu, item) => {
          const keys = Object.keys(item.modification);
          if (keys.length && keys[0].toLowerCase() != 'useraccountcontrol')
            acu.push(item);
          return acu;
        }, []);
      }
    }

    return request.user.username == this.config.ldap.rootUser || selfChange;
  }
}