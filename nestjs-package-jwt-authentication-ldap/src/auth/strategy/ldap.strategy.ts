import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import Strategy from 'passport-ldapauth';
import { CONFIG_SERVICE } from '../../common/constants';
import { ModuleOptionsConfig } from '../../common/interfaces';
import { AuthService } from '../auth.service';
import { SearchUserRecordResponseDto } from '../ldap/dto';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(
    private authService: AuthService,
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

  async validate(username: string): Promise<SearchUserRecordResponseDto> {
    // this gets called once the LDAP authentication succeeds
    // you can add additional logic here like fetching user roles
    const user = await this.authService.validate(username);
    if (!user) {
      throw new UnauthorizedException(`user '${username}' not found in the system`);
    }
    // return the user object that will be attached to the request as req.user
    return user;
  }
}
