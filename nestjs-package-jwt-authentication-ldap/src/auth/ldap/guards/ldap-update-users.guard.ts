import { Injectable, CanActivate, ExecutionContext, Inject, Logger } from '@nestjs/common';
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
    // Logger.log(`request: ${JSON.stringify(request.user, undefined, 2)}`, LdapUpdateUsersGuard.name);
    // Logger.log(`request.body: ${JSON.stringify(request.body, undefined, 2)}`, LdapUpdateUsersGuard.name);

    if (!request.user) {
      return false;
    }

    if (request.body.changes) {
      request.body.changes = request.body.changes.reduce((acu, item) => {
        const keys = Object.keys(item.modification);
        const permittedKeys = ['givenName', 'sn', 'displayName', 'mail'];
        // protectedKeys
        // if (keys.length && keys[0].toLowerCase() !== 'useraccountcontrol') {
        // permittedKeys
        if (keys.length && permittedKeys.includes(keys[0].toLowerCase())) {
          acu.push(item);
        }
        return acu;
      }, []);
    }
    return true;
  }
}
