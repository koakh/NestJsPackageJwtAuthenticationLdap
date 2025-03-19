import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { SignOptions } from 'jsonwebtoken';
import { CONFIG_SERVICE } from '../common/constants';
import { ModuleOptionsConfig } from '../common/interfaces';
import { asyncForEach, sortArrayString } from '../common/utils/util';
import { AuthStore } from './auth.store';
import { AccessToken, SignJwtToken } from './interfaces';
import { JwtResponsePayload } from './interfaces/jwt-response-payload.interface';
import { GroupTypeOu } from './ldap/enums';
import { constants as c } from './ldap/ldap.constants';
import { LdapService } from './ldap/ldap.service';
import { constantCase, hashPassword } from './utils';

@Injectable()
export class AuthService {
  // init usersStore
  usersStore: AuthStore = new AuthStore(this.config);

  constructor(
    private readonly jwtService: JwtService,
    private readonly ldapService: LdapService,
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
  ) { }

  async signJwtToken(user: SignJwtToken, options?: SignOptions): Promise<AccessToken> {
    // note: we choose a property name of sub to hold our userId value to be consistent with JWT standards
    const payload = { username: user.username, sub: user.userId, roles: user.roles, permissions: user.permissions, metaData: user.metaData };
    // override accessTokenExpiresIn
    if (user.userId.toLocaleLowerCase().includes(`OU=${c.DEVELOPER_GROUP}`.toLocaleLowerCase())) {
      options = { ...options, expiresIn: c.DEVELOPER_ACCESS_TOKEN_EXPIRES_IN };
    }
    return {
      // generate JWT from a subset of the user object properties
      accessToken: this.jwtService.sign(payload, {
        ...options,
        secret: this.config.auth.accessTokenJwtSecret instanceof Function
          ? this.config.auth.accessTokenJwtSecret()
          : this.config.auth.accessTokenJwtSecret,
      }),
    };
  }

  async signRefreshToken(user: SignJwtToken, tokenVersion: number, options?: SignOptions): Promise<AccessToken> {
    const payload = { username: user.username, sub: user.userId, roles: user.roles, permissions: user.permissions, metaData: user.metaData, tokenVersion };
    return {
      // generate JWT from a subset of the user object properties
      accessToken: this.jwtService.sign(payload, {
        ...options,
        // require to use refreshTokenJwtSecret
        secret: this.config.auth.refreshTokenJwtSecret instanceof Function
          ? this.config.auth.refreshTokenJwtSecret()
          : this.config.auth.refreshTokenJwtSecret,
        expiresIn: this.config.auth.refreshTokenExpiresIn,
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

  async getRolesAndPermissionsFromMemberOf(memberOf: string[], licenseActivated: true): Promise<[string[], string[]]> {
    if (!memberOf || !Array.isArray(memberOf) && typeof memberOf !== 'string' || memberOf.length <= 0) {
      return [[], []];
    }

    // we sent all memberOf, must exclude profiles here to
    // const groupExcludeProfileGroupsArray = this.config.ldap.searchGroupExcludeProfileGroups.split(',');
    const rolePermittedUnlicensedPermissionGroupsArray = this.config.auth.rolePermittedUnlicensedPermissionGroups.split(',');

    // if memberOf is a string, in case of ldap have only one group, we must modify memberOf to be an array, else it fails on map
    if (typeof memberOf === 'string') {
      memberOf = [memberOf];
    }

    const roles: string[] = [];
    const permissions: string[] = [];
    await asyncForEach(memberOf, async (e: string) => {
      // memberOf.forEach(async (e: string) => {
      const memberOfRole: string[] = e.split(',');
      const groupName = memberOfRole[0].split('=')[1];
      // deprecated, now we never exclude groups from roles
      // const excluded = groupExcludeProfileGroupsArray.length > 0 && groupExcludeProfileGroupsArray.findIndex(e => e === groupName) >= 0;
      // always hide non prefixed groups like 'Domain Admins'
      const excluded = !groupName.startsWith(this.config.ldap.searchGroupProfilesPrefix);
      // must exclude groups but here must let pass AUTH_DEVELOPER_ROLE
      if (memberOfRole[0].includes('=') && !excluded) {
        // C3 with C3_, and space with _
        roles.push(groupName.replace(this.config.ldap.searchGroupProfilesPrefix, `${this.config.ldap.searchGroupProfilesPrefix}_`).replace(' ', '_').toUpperCase());
        const groupObject = await this.ldapService.getGroupRecord(groupName, GroupTypeOu.PROFILES, false);
        if (groupObject.groups && Array.isArray(groupObject.groups[0].permissions)) {
          // get current role permissions
          const groupPermissions = groupObject.groups[0].permissions.map(g => {
            // Logger.log(`${groupObject.groups[0].name} permissions ${e}`, AuthService.name);
            const split = g.split('@');
            // must replace start RP with RP_ else we can get issues like RPGGO and not RP_GGO
            const permission = constantCase(split[0].replace(this.config.ldap.searchGroupPermissionsPrefix, `${this.config.ldap.searchGroupPermissionsPrefix}_`).replace(' ', '_'));
            const permissionAction = split[1] ? constantCase(split[1]) : undefined;
            return permissionAction ? `${permission}@${permissionAction}` : permission;
          });
          // if permission don't exist on permissions, push it
          groupPermissions.forEach((p) => {
            // check if is a permitted unlicensed permission
            const permittedUnlicensedPermission = rolePermittedUnlicensedPermissionGroupsArray.length > 0 && rolePermittedUnlicensedPermissionGroupsArray.findIndex(r => r === p) >= 0;
            // Logger.log(`permission: '${p}', permittedUnlicensedPermission: '${permittedUnlicensedPermission}', licenseActivated: '${licenseActivated}'`, AuthService.name);
            // add permission in not added already, and if licensed, or unlicensed and is a permittedUnlicensedPermission
            if (permissions.indexOf(p) < 0 && (licenseActivated || (!licenseActivated && permittedUnlicensedPermission))) {
              permissions.push(p);
            }
          });
        }
      }
    });
    // return with sorted permissions
    return [roles, sortArrayString(permissions)];
  }

  async validate(username: string) {
    return await this.ldapService.getUserRecord(username);
  }
}
