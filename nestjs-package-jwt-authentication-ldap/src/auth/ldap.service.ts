import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ldap from 'ldapjs';
import { Client } from 'ldapjs';
import { envConstants } from '../common/constants/env';
import { LdapSearchUsernameDto } from './dto';

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
    // test getUserRecord
    const user = await this.getUserRecord('mario');
    Logger.log(`user: [${JSON.stringify(user, undefined, 2)}]`);
  }

  getUserRecord = (username: string): Promise<LdapSearchUsernameDto> => {
    return new Promise((resolve, reject) => {
      try {
        let user: { username: string, email: string, roles: string[], controls: string[] };
        // note to work we must use the scope sub else it won't work
        this.ldapClient.search(this.searchBase, { attributes: this.searchAttributes, scope: 'sub', filter: `(cn=${username})` }, (err, res) => {
          // this.ldapClient.search(this.searchBase, { filter: this.searchFilter, attributes: this.searchAttributes }, (err, res) => {
          if (err) Logger.log(err);
          res.on('searchEntry', (entry) => {
            // Logger.log(`entry.object: [${JSON.stringify(entry.object, undefined, 2)}]`);
            user = {
              // extract username from string | array
              username: entry.object.cn as string,
              email: (entry.object as any).userPrincipalName,
              roles: (entry.object as any).memberOf,
              controls: (entry.object as any).controls,
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
}
