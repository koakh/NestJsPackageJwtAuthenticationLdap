import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { SignOptions } from 'jsonwebtoken';
import { CONFIG_SERVICE } from '../common/constants';
import { ModuleOptionsConfig } from '../common/interfaces';
import { AuthStore } from './auth.store';
import { AccessToken } from './interfaces';
import { JwtResponsePayload } from './interfaces/jwt-response-payload.interface';
import { hashPassword } from './utils/util';
@Injectable()
export class AuthService {
  // init usersStore
  usersStore: AuthStore = new AuthStore(this.config);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
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
        secret: this.config.jwt.refreshTokenJwtSecret,
        expiresIn: this.config.jwt.refreshTokenExpiresIn,
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
    const groupExcludeRolesGroupArray = this.config.ldap.searchGroupExcludeRolesGroups.split(',');

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
      const excluded = groupExcludeRolesGroupArray.length > 0 && groupExcludeRolesGroupArray.findIndex(e => e === groupName) >= 0;
      // must exclude groups but here must let pass AUTH_DEVELOPER_ROLE
      if (memberOfRole[0].includes('=') && !excluded) {
        roles.push(groupName.replace('C3', 'C3_').replace(' ', '_').toUpperCase());
      }
    });
    return roles;
  }
}
