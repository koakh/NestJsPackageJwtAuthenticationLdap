import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ldap from 'ldapjs';
import { Client } from 'ldapjs';
import { envConstants } from '../../common/constants/env';
import { LdapSearchUsernameResponseDto } from '../dto';
import { UserAccountControl } from './enums';
import { CreateLdapUserDto } from './dto';
import { CreateLdapUserModel } from './models';
import { parseTemplate } from './ldap.util';
import { constants as c } from './ldap.constants';
import * as ssha256 from 'node-ssha256';

/**
 * user model
 * https://bitbucket.org/criticallinksteam/c3/src/develop/src/backend/userModel.js
 */

@Injectable()
export class LdapService {
  private ldapClient: Client;
  private searchBase: string;
  private searchAttributes: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    // init ldapServer
    this.init(configService);
  }
  // called by GqlLocalAuthGuard
  async init(configService: ConfigService): Promise<any> {
    const clientOptions: ldap.ClientOptions = {
      url: `ldap://${configService.get(envConstants.LDAP_URL)}`,
      bindDN: this.configService.get(envConstants.LDAP_BIND_DN),
      bindCredentials: configService.get(envConstants.LDAP_BIND_CREDENTIALS),
    };
    // props
    this.searchBase = configService.get(envConstants.LDAP_SEARCH_BASE);
    this.searchAttributes = configService.get(envConstants.LDAP_SEARCH_ATTRIBUTES).toString().split(';');
    // create client
    this.ldapClient = ldap.createClient(clientOptions);
    // uncomment to test getUserRecord on init
    // const user = await this.getUserRecord('mario');
    // Logger.log(`user: [${JSON.stringify(user, undefined, 2)}]`);
  }

  getUserRecord = (username: string): Promise<LdapSearchUsernameResponseDto> => {
    return new Promise((resolve, reject) => {
      try {
        let user: { username: string, dn: string, email: string, memberOf: string[], controls: string[] };
        // note to work we must use the scope sub else it won't work
        this.ldapClient.search(this.searchBase, { attributes: this.searchAttributes, scope: 'sub', filter: `(cn=${username})` }, (err, res) => {
          // this.ldapClient.search(this.searchBase, { filter: this.searchFilter, attributes: this.searchAttributes }, (err, res) => {
          if (err) Logger.log(err);
          res.on('searchEntry', (entry) => {
            // Logger.log(`entry.object: [${JSON.stringify(entry.object, undefined, 2)}]`);
            user = {
              // extract username from string | array
              username: entry.object.cn as string,
              dn: entry.object.dn as string,
              email: entry.object.userPrincipalName as string,
              memberOf: entry.object.memberOf as string[],
              controls: entry.object.controls as string[],
            };
          });
          res.on('error', (error) => {
            throw error;
          });
          res.on('end', (result: ldap.LDAPResult) => {
            // Logger.log(`status: [${result.status}]`, LdapService.name);
            // responsePayload.result = result;
            // resolve promise
            resolve({ user, status: result.status });
          });
        });
      } catch (error) {
        // Logger.error(`error: [${error.message}]`, LdapService.name);
        // reject promise
        reject(error);
      }
    })
  };

  createUserRecord(createLdapUserDto: CreateLdapUserDto): Promise<void> {
    return new Promise((resolve, reject) => {
      // outside of try, catch must have access to entry object
      // const defaultNamePostfix = this.configService.get(envConstants.LDAP_SEARCH_ATTRIBUTES);
      const cn = `${createLdapUserDto.firstName} ${createLdapUserDto.lastName}`;
      const newUser: CreateLdapUserModel = {
        // dn: createLdapUserDto.distinguishedName,
        cn,
        name: createLdapUserDto.username,
        sn: createLdapUserDto.username,
        mail: createLdapUserDto.email,
        // class that has custom attributes ex "objectClass": "User"
        objectclass: createLdapUserDto.objectClass,
        userPassword: ssha256.create(createLdapUserDto.password),
        // givenname: createLdapUserDto.firstName,
        // userPrincipalName: createLdapUserDto.email,
        sAMAccountName: createLdapUserDto.username,
        userAccountControl: UserAccountControl.NORMAL_ACCOUNT,
      };
      try {
        const newDN = `CN=${cn},CN=Users,DC=c3edu,DC=online`;
        this.ldapClient.add(newDN, newUser, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } catch (error) {
        // const message = (error && error.name === 'InvalidDistinguishedNameError')
        //   ? { message: parseTemplate(c.INVALID_DISTINGUISHED_NAME_ERROR, createLdapUserDto), newUser }
        //   : error;
        reject(error);
      }
    });
  };

  // STUB promise template
  // createUserRecord(createLdapUserDto: CreateLdapUserDto): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       resolve();
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  // };
}
