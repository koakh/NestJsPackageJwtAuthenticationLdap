import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ldap from 'ldapjs';
import { Client } from 'ldapjs';
import { envConstants as e } from '../../common/constants/env';
import { encodeAdPassword } from '../utils';
import { AddUserToGroupDto, ChangeUserRecordDto, CreateUserRecordDto, SearchUserRecordDto, SearchUserRecordResponseDto, SearchUserRecordsResponseDto } from './dto';
import { UserAccountControl, UserObjectClass } from './enums';
import { CreateLdapUserModel } from './models';

/**
 * user model
 * https://bitbucket.org/criticallinksteam/c3/src/develop/src/backend/userModel.js
 */

@Injectable()
export class LdapService {
  private ldapClient: Client;
  private searchBase: string;
  private searchAttributes: string;
  // private inMemoryUsers: Record<number, SearchUserRecordDto[]> = {};

  constructor(
    private readonly configService: ConfigService,
  ) {
    // init ldapServer
    this.init(configService);
  }
  // called by GqlLocalAuthGuard
  async init(configService: ConfigService): Promise<any> {
    const clientOptions: ldap.ClientOptions = {
      url: `ldap://${configService.get(e.LDAP_URL)}`,
      bindDN: this.configService.get(e.LDAP_BIND_DN),
      bindCredentials: configService.get(e.LDAP_BIND_CREDENTIALS),
    };
    // props
    this.searchBase = configService.get(e.LDAP_SEARCH_BASE);
    this.searchAttributes = configService.get(e.LDAP_SEARCH_ATTRIBUTES).toString().split(',');
    // create client
    this.ldapClient = ldap.createClient(clientOptions);
    // uncomment to test getUserRecord on init
    // const user = await this.getUserRecord('mario');
    // Logger.log(`user: [${JSON.stringify(user, undefined, 2)}]`, LdapService.name);
  }

  getUserRecord = (username: string): Promise<SearchUserRecordResponseDto> => {
    return new Promise((resolve, reject) => {
      try {
        // let user: { username: string, dn: string, email: string, memberOf: string[], controls: string[] };
        let user: SearchUserRecordDto;
        // note to work we must use the scope sub else it won't work
        this.ldapClient.search(this.searchBase, { attributes: this.searchAttributes, scope: 'sub', filter: `(cn=${username})` }, (err, res) => {
          // this.ldapClient.search(this.searchBase, { filter: this.searchFilter, attributes: this.searchAttributes }, (err, res) => {
          if (err) Logger.log(err);
          res.on('searchEntry', (entry) => {
            // Logger.log(`entry.object: [${JSON.stringify(entry.object, undefined, 2)}]`);
            user = {
              // extract username from string | array
              dn: entry.object.dn as string,
              memberOf: entry.object.memberOf as string[],
              controls: entry.object.controls as string[],
              objectCategory: entry.object.objectCategory as string,
              userAccountControl: entry.object.userAccountControl as string,
              lastLogonTimestamp: entry.object.lastLogonTimestamp as string,
              username: entry.object.cn as string,
              email: entry.object.userPrincipalName as string,
              displayName: entry.object.displayName as string,
              gender: entry.object.gender as string,
              mail: entry.object.mail as string,
              C3UserRole: entry.object.C3UserRole as string,
              dateOfBirth: entry.object.dateOfBirth as string,
              studentID: entry.object.studentID as string,
              telephoneNumber: entry.object.telephoneNumber as string,
            };
          });
          res.on('error', (error) => {
            throw error;
          });
          res.on('end', (result: ldap.LDAPResult) => {
            // Logger.log(`status: [${result.status}]`, LdapService.name);
            // responsePayload.result = result;
            // resolve promise
            user
              ? resolve({ user, status: result.status })
              : reject({ message: `user not found`, status: result.status });
          });
        });
      } catch (error) {
        // Logger.error(`error: [${error.message}]`, LdapService.name);
        // reject promise
        reject(error);
      }
    })
  };

  /**
   * pagination version
   */
  // TODO: args payload object with filter, pagination props etc
  getUserRecords = (): Promise<SearchUserRecordsResponseDto> => {
    return new Promise((resolve, reject) => {
      try {
        // let user: { username: string, dn: string, email: string, memberOf: string[], controls: string[] };
        let user: SearchUserRecordDto;
        // note to work we must use the scope sub else it won't work
// TODO
const users: SearchUserRecordDto[] = [];
// const pageSize = 1;
let countUsers = 0;
let currentPage = 0;
let recordsFound = 0;
const startTime = process.hrtime();
// const filter = `(cn=${username})`;
const filter = `(objectCategory=CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online)`;
// const paged: {pageSize: number, pagePause: boolean} = {
//   pageSize,
//   pagePause: true
// };
        // TODO: on search many use minimal search attributes
        this.ldapClient.search(this.searchBase, { attributes: this.searchAttributes, scope: 'sub', filter,
// works: fire on page with first 200, and keeps going render all 11k and fire at 'end' event
// paged: true,
// sizeLimit: 200
// works
paged: {
  pageSize: 1000,
  pagePause: true
},
       }, (err, res) => {
          // this.ldapClient.search(this.searchBase, { filter: this.searchFilter, attributes: this.searchAttributes }, (err, res) => {
          if (err) Logger.error(err, LdapService.name);
          res.on('searchEntry', (entry) => {
// TODO
countUsers++;
// Logger.log(`entry.object: [${JSON.stringify(entry.object, undefined, 2)}]`);
// Logger.log(`entry.object: [${entry.object.dn}: ${countUsers}]`, LdapService.name);
            user = {
              // extract username from string | array
              dn: entry.object.dn as string,
              memberOf: entry.object.memberOf as string[],
              controls: entry.object.controls as string[],
              objectCategory: entry.object.objectCategory as string,
              userAccountControl: entry.object.userAccountControl as string,
              lastLogonTimestamp: entry.object.lastLogonTimestamp as string,
              username: entry.object.cn as string,
              email: entry.object.userPrincipalName as string,
              displayName: entry.object.displayName as string,
              gender: entry.object.gender as string,
              mail: entry.object.mail as string,
              C3UserRole: entry.object.C3UserRole as string,
              dateOfBirth: entry.object.dateOfBirth as string,
              studentID: entry.object.studentID as string,
              telephoneNumber: entry.object.telephoneNumber as string,
            };
// TODO
users.push(user);
          });
          res.on('page', (result, onPageCallback) => {
// push to pages
currentPage++;
// assign only if null
if (!recordsFound && result.controls && result.controls[0]) {recordsFound = result.controls[0]._value.size};
const totalPageRecords = (result.controls && result.controls[0]) ? result.controls[0]._value.cookie[0] : null;
// const {_value: {size: recordsSize} } = (result.controls as any);
// Logger.log(`page end result.controls: ${JSON.stringify(result.controls, undefined, 2)}`, LdapService.name);
Logger.log(`page end currentPage: '${currentPage}', recordsFound: '${recordsFound}', totalPageRecords: '${totalPageRecords}'`, LdapService.name);
// this.inMemoryUsers[currentPage] = users;
// cleanUp users for next page round
// users = [];
// tslint:disable-next-line: max-line-length
// call the callBack requesting more pages, this will continue to search, only call if onPageCallback is not null, when arrives last page it will be null
if (onPageCallback) {onPageCallback();};
// use the page event to continue with next page if the sizeLimit (of page) is reached.
// users.length > 0
// // users.length > 0
//   // TODO use user or users
//   ? resolve({ user, users, status: result.status })
//   // ? resolve({ user, users, status: result.status })
//   : reject({ message: `user not found`, status: result.status });
          });
          res.on('error', (error) => {
            throw error;
          });
          res.on('end', (result: ldap.LDAPResult) => {
            // Logger.log(`status: [${result.status}]`, LdapService.name);
            // responsePayload.result = result;
            // resolve promise
debugger;
const parseHrtimeToSeconds = (hrtime) => {
  const seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
  return seconds;
}
const timeTaken = parseHrtimeToSeconds(process.hrtime(startTime));
users.length > 0
  ? resolve({ users, timeTaken, status: result.status })
  // ? resolve({ user, users, status: result.status })
  : reject({ message: `records not found`, status: result.status });
          });
        });
      } catch (error) {
        // Logger.error(`error: [${error.message}]`, LdapService.name);
        // reject promise
        reject(error);
      }
    })
  };

  createUserRecord(createLdapUserDto: CreateUserRecordDto): Promise<void> {
    return new Promise((resolve, reject) => {
      // outside of try, catch must have access to entry object
      // const defaultNamePostfix = this.configService.get(e.LDAP_SEARCH_ATTRIBUTES);
      // const cn = `${createLdapUserDto.firstName} ${createLdapUserDto.lastName}`;
      const cn = createLdapUserDto.username;
      const newUser: CreateLdapUserModel = {
        cn,
        name: createLdapUserDto.username,
        givenname: createLdapUserDto.firstName,
        sn: createLdapUserDto.lastName,
        // tslint:disable-next-line: max-line-length
        displayName: (createLdapUserDto.displayName) ? createLdapUserDto.displayName : `${createLdapUserDto.firstName} ${createLdapUserDto.firstName}`,
        // class that has custom attributes ex "objectClass": "User"
        objectclass: createLdapUserDto.objectClass ? createLdapUserDto.objectClass : UserObjectClass.USER,
        unicodePwd: encodeAdPassword(createLdapUserDto.password),
        sAMAccountName: createLdapUserDto.username,
        userAccountControl: UserAccountControl.NORMAL_ACCOUNT,
        // optionals
        mail: createLdapUserDto.mail,
        dateOfBirth: createLdapUserDto.dateOfBirth,
        gender: createLdapUserDto.gender,
        telephoneNumber: createLdapUserDto.telephoneNumber,
        studentID: createLdapUserDto.studentID,
      };

      try {
        const newDN = `cn=${cn},${this.configService.get(e.LDAP_NEW_USER_DN_POSTFIX)},${this.configService.get(e.LDAP_BASE_DN)}`;
        this.ldapClient.add(newDN, newUser, async (error) => {
          if (error) {
            reject(error);
          } else {
            await this.addUserToGroup({ username: newUser.cn, group: 'c3student' });
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

  /**
   * add group/role to user
   * @param memberDN
   */
  addUserToGroup(addUserToGroupDto: AddUserToGroupDto): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const groupDN = `cn=${addUserToGroupDto.group},ou=Groups,dc=c3edu,dc=online`;
        const groupChange = new ldap.Change({
          operation: 'add',
          modification: {
            member: `cn=${addUserToGroupDto.username},ou=C3Student,ou=People,dc=c3edu,dc=online`
          }
        });
        this.ldapClient.modify(groupDN, groupChange, (error) => {
          if (error) {
            throw (error);
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  deleteUserRecord(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const delDN = `cn=${username},${this.configService.get(e.LDAP_NEW_USER_DN_POSTFIX)},${this.configService.get(e.LDAP_BASE_DN)}`;
      try {
        this.ldapClient.del(delDN, async (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * change user record
   * @param memberDN
   */
  changeUserRecord(username: string, changeUserRecordDto: ChangeUserRecordDto): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const changeDN = `cn=${username},${this.configService.get(e.LDAP_NEW_USER_DN_POSTFIX)},${this.configService.get(e.LDAP_BASE_DN)}`;
        // map array of changes to ldap.Change
        const changes = changeUserRecordDto.changes.map((change: ldap.Change) => {
          return new ldap.Change({
            operation: change.operation,
            modification: change.modification
          });
        });

        this.ldapClient.modify(changeDN, changes, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } catch (error) {
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
