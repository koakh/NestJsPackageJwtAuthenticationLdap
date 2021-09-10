import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { SignOptions } from 'jsonwebtoken';
import { envConstants } from '../common/constants/env';
import { AuthStore } from './auth.store';
import { AccessToken } from './interfaces';
import { JwtResponsePayload } from './interfaces/jwt-response-payload.interface';
import { hashPassword } from './utils/util';
import { constants } from './ldap/ldap.constants';
@Injectable()
export class AuthService {
  // init usersStore
  usersStore: AuthStore = new AuthStore(this.configService);

  constructor(
    private readonly configService: ConfigService,
    // private readonly ldapService: LdapService,
    private readonly jwtService: JwtService,
  ) { }
  async signJwtToken(user: any, options?: SignOptions): Promise<AccessToken> {
    // note: we choose a property name of sub to hold our userId value to be consistent with JWT standards
    const payload = { username: user.username, sub: user.userId, roles: user.roles, metaData: user.metaData };
    return {
      // generate JWT from a subset of the user object properties
      accessToken: this.jwtService.sign(payload, options),
    };
  }

  async signRefreshToken(user: any, tokenVersion: number, options?: SignOptions): Promise<AccessToken> {
    const payload = { username: user.username, sub: user.userId, roles: user.roles, metaData: user.metaData, tokenVersion };
    return {
      // generate JWT from a subset of the user object properties
      accessToken: this.jwtService.sign(payload, {
        ...options,
        // require to use refreshTokenJwtSecret
        secret: this.configService.get(envConstants.REFRESH_TOKEN_JWT_SECRET),
        expiresIn: this.configService.get(envConstants.REFRESH_TOKEN_EXPIRES_IN),
      }),
    };
  }

  sendRefreshToken(res: Response, { accessToken }: AccessToken): void {
    res.cookie('jid', accessToken, {
      // prevent javascript access
      httpOnly: true,
    });
  }

  getJwtPayLoad(token: string): JwtResponsePayload {
    return this.jwtService.verify(token);
  }

  // tslint:disable-next-line: no-shadowed-variable
  bcryptValidate(password: string, hashPassword: string): boolean {
    return bcrypt.compareSync(password, hashPassword);
  }

  hashPassword(password: string): string {
    return hashPassword(password);
  }

  getRolesFromMemberOf(memberOf: string[]): string[] {
    const groupExcludeGroupsArray = this.configService.get(envConstants.LDAP_SEARCH_GROUP_EXCLUDE_GROUPS).split(',');
    // extract CN=
    const excludeGroupsArray = groupExcludeGroupsArray;//groupExcludeGroupsArray.map(e => e.split('=')[0]);

    if (!memberOf || !Array.isArray(memberOf) && typeof memberOf !== 'string' || memberOf.length <= 0) {
      return [];
    }
    // if memberOf is a string, in case of ldap have only one group, we must modify memberOf to be an array, else it fails on map
    if (typeof memberOf === 'string') {
      memberOf = [memberOf];
    }
    const roles: string[] = [];
    memberOf.forEach((e: string) => {
      const memberOfRole: string[] = e.split(',');
      const groupName = memberOfRole[0].split('=')[1];
      const excluded = excludeGroupsArray.length > 0 && excludeGroupsArray.findIndex(e => e === groupName) >= 0;
      const isDeveloper = groupName === constants.AUTH_DEVELOPER_ROLE_CAMEL_CASE;
      // get first group, and only add c3 prefixed roles
      // must exclude groups but here must let pass AUTH_DEVELOPER_ROLE
      if (memberOfRole[0].includes('=') && (!excluded || isDeveloper)) {
        roles.push(groupName.replace('C3', 'C3_').replace(' ', '_').toUpperCase());
      }
    });
    return roles;
  }
}
