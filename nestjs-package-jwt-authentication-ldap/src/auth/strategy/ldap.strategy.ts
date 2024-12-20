import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import Strategy from 'passport-ldapauth';
import { CONFIG_SERVICE } from '../../common/constants';
import { ModuleOptionsConfig } from '../../common/interfaces';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
  ) {
    super({
      // allows us to pass back the entire request to the callback
      passReqToCallback: true,
      server: {
        // ldapOptions
        url: `ldap://${config.ldap.address}:${config.ldap.port}`,
        bindDN: config.ldap.bindDN,
        bindCredentials: config.ldap.bindCredentials,
        searchBase: config.ldap.searchBase,
        // don't change searchFilter and searchAttributes variables name, this is a options object to be used in ldap server
        searchFilter: config.ldap.searchUserFilterStrategy,
        searchAttributes: config.ldap.searchUserAttributes.toString().split(','),
      },
    }, async (req: Request, user: any, done) => {
      // add user to request
      req.user = user;
      return done(null, user);
    });
  }
}