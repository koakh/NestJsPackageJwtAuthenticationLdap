import { Injectable, CanActivate, ExecutionContext, Inject, Logger } from '@nestjs/common';
import { ModuleOptionsConfig } from '../../../common/interfaces';
import { CONFIG_SERVICE } from '../../../common/constants';

// this guard is to prevent user profile update, to use only permittedKeys

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
        const permittedKeys = ['givenName', 'sn', 'displayName', 'mail', 'telephoneNumber', 'unicodePwd' ];
        // protectedKeys
        // if (keys.length && keys[0].toLowerCase() !== 'useraccountcontrol') {
        // permittedKeys
        if (keys.length && permittedKeys.includes(keys[0])) {
          acu.push(item);
        } else {
          Logger.warn(`LdapUpdateUsersGuard canActivate invalid attribute: '${JSON.stringify(item)}', attribute is skipped from changes`, LdapUpdateUsersGuard.name);
        }
        return acu;
      }, []);
    }

    return true;
  }
}
