import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import * as Strategy from 'passport-ldapauth';
import { envConstants } from '../../common/constants';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(private readonly configService: ConfigService) {
    super({
      // allows us to pass back the entire request to the callback
      passReqToCallback: true,
      server: {
        // ldapOptions
        url: configService.get(envConstants.LDAP_URL),
        bindDN: configService.get(envConstants.LDAP_BIND_DN),
        bindCredentials: configService.get(envConstants.LDAP_BIND_CREDENTIALS),
        searchBase: configService.get(envConstants.LDAP_SEARCH_BASE),
        searchFilter: configService.get(envConstants.LDAP_SEARCH_FILTER),
        searchAttributes: configService.get(envConstants.LDAP_SEARCH_ATTRIBUTES),
      },
    }, async (req: Request, user: any, done) => {
      req.user = user;
      return done(null, user);
    });
  }
}