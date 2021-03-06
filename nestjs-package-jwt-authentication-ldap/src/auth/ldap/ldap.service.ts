import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ldap from 'ldapjs';
import { Client } from 'ldapjs';
import { envConstants as e } from '../../common/constants/env';
import { filterator, getMemoryUsage, getMemoryUsageDifference, paginator, recordToArray } from '../../common/utils/util';
import { encodeAdPassword } from '../utils';
// tslint:disable-next-line: max-line-length
import { AddOrDeleteUserToGroupDto, CacheResponseDto, ChangeDefaultGroupDto, ChangeUserPasswordDto, ChangeUserRecordDto, CreateUserRecordDto, DeleteUserRecordDto, SearchUserPaginatorResponseDto, SearchUserRecordDto, SearchUserRecordResponseDto, SearchUserRecordsDto } from './dto';
import { ChangeUserRecordOperation, UpdateCacheOperation, UserAccountControl, UserObjectClass } from './enums';
import { Cache } from './interfaces';
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
  private cache: Cache;

  constructor(
    private readonly configService: ConfigService,
  ) {
    // init ldapServer
    this.init(configService);
    // init cache object
    this.cache = {
      lastUpdate: undefined,
      totalRecords: undefined,
      elapsedTime: undefined,
      memoryUsage: undefined,
      status: undefined,
      users: {}
    };
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

  /**
   * helper method to update cache, on ldap changes
   * @param operation
   * @param username 
   */
  updateCachedUser(operation: UpdateCacheOperation, username: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        let key;
        // Logger.log(`UpdateCacheOperation operation: '${operation}'`, LdapService.name);
        switch (operation) {
          case UpdateCacheOperation.CREATE:
            // add user to cache, always get it from ldap to double check that it is inSync
            this.cache.users[username] = (await this.getUserRecord(username)).user;
            break;
          case UpdateCacheOperation.UPDATE:
            key = (Object.keys(this.cache.users) as Array<string>).find((key) => this.cache.users[key].username === username);
            // Logger.log(`this.cache.users[username]:${JSON.stringify(this.cache.users[key], undefined, 2)}`, LdapService.name)
            // update user in cache, always get it from ldap to double check that it is inSync
            this.cache.users[key] = (await this.getUserRecord(username)).user;
            break;
          case UpdateCacheOperation.DELETE:
            key = (Object.keys(this.cache.users) as Array<string>).find((key) => this.cache.users[key].username === username);
            // remove user from cache, we need a filteredUsers array helper
            const filteredUsers: Record<string, SearchUserRecordDto> = {};
            recordToArray(this.cache.users).forEach((e: SearchUserRecordDto) => {
              if (e.username != username) {
                // add to filteredUsers
                filteredUsers[e.username] = e;
              }
            });
            // update cached users without deleted user
            this.cache.users = filteredUsers;
            break;
          default:
            break;
        }
        // resolve promise
        resolve();
      } catch (error) {
        // reject promise
        reject(error);
      }
    })
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
              // if only have on group we must convert ldap string to array to ve consistent
              memberOf: (typeof entry.object.memberOf === 'string') ? [entry.object.memberOf] : entry.object.memberOf,
              controls: entry.object.controls as string[],
              objectCategory: entry.object.objectCategory as string,
              userAccountControl: entry.object.userAccountControl as string,
              lastLogonTimestamp: entry.object.lastLogonTimestamp as string,
              username: entry.object.cn as string,
              firstName: entry.object.givenName as string,
              lastName: entry.object.sn as string,
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
   * init/update inMemory cache
   */
  // tslint:disable-next-line: max-line-length
  initUserRecordsCache = (
    // if empty in payload use default
    filter: string,
    pageSize: number = 1000
  ): Promise<CacheResponseDto> => {
    return new Promise((resolve, reject) => {
      const showDebug = false;
      try {
        // if filter is undefined, use default filter
        filter = filter ? filter : this.configService.get(e.LDAP_NEW_USER_DN_POSTFIX);
        // note to work we must use the scope sub else it won't work
        let user: SearchUserRecordDto;
        // recordsFound sums on page event
        let recordsFound = 0;
        let currentPage = 0;
        // benchMark and memoryUsage
        const startTime = process.hrtime();
        const startMemoryUsage = getMemoryUsage();
        // start search by filter
        this.ldapClient.search(this.searchBase, {
          attributes: this.searchAttributes, scope: 'sub', filter,
          paged: {
            pageSize,
            pagePause: true
          },
        }, (err, res) => {
          if (err) Logger.error(err, LdapService.name);
          res.on('searchEntry', (entry) => {
            recordsFound++;
            const dn = entry.object.dn as string;
            if (showDebug) {
              Logger.log(`entry.object: [${JSON.stringify(entry.object, undefined, 2)}]`);
              Logger.log(`entry.object: [${entry.object.dn}: ${recordsFound}]`, LdapService.name);
            }
            user = {
              // extract username from string | array
              dn,
              memberOf: (typeof entry.object.memberOf === 'string') ? [entry.object.memberOf] : entry.object.memberOf,
              controls: entry.object.controls as string[],
              objectCategory: entry.object.objectCategory as string,
              userAccountControl: entry.object.userAccountControl as string,
              lastLogonTimestamp: entry.object.lastLogonTimestamp as string,
              username: entry.object.cn as string,
              firstName: entry.object.givenName as string,
              lastName: entry.object.sn as string,
              email: entry.object.userPrincipalName as string,
              displayName: entry.object.displayName as string,
              gender: entry.object.gender as string,
              mail: entry.object.mail as string,
              C3UserRole: entry.object.C3UserRole as string,
              dateOfBirth: entry.object.dateOfBirth as string,
              studentID: entry.object.studentID as string,
              telephoneNumber: entry.object.telephoneNumber as string,
            };
            // add user to inMemoryUsers with dn key
            this.cache.users[dn] = user;
          });
          res.on('page', (result, onPageCallback) => {
            // push to pages
            currentPage++;
            // assign only if null
            if (!recordsFound && result.controls && result.controls[0]) { recordsFound = result.controls[0]._value.size };
            // NOTE: debug stuff: leave it here for future development
            if (showDebug) {
              const totalPageRecords = (result.controls && result.controls[0]) ? result.controls[0]._value.cookie[0] >= 0 : null;
              // const {_value: {size: recordsSize} } = (result.controls as any);
              Logger.log(`page end result.controls: ${JSON.stringify(result.controls, undefined, 2)}`, LdapService.name);
              // tslint:disable-next-line: max-line-length
              Logger.log(`page end event: currentPage: '${currentPage}', recordsFound: '${recordsFound}', totalPageRecords: '${totalPageRecords}'`, LdapService.name);
              // use the page event to continue with next page if the sizeLimit (of page) is reached.
              // tslint:disable-next-line: max-line-length
              // call the callBack requesting more pages, this will continue to search, only call if onPageCallback is not null, when arrives last page it will be null
            }
            if (onPageCallback) { onPageCallback(); };
          });
          res.on('error', (error) => {
            reject(error);
          });
          res.on('end', (result: ldap.LDAPResult) => {
            // benchMark and memoryUsage
            const parseHrtimeToSeconds = (hrtime) => {
              const seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
              return seconds;
            }
            const elapsedTime = parseHrtimeToSeconds(process.hrtime(startTime));
            const endMemoryUsage = getMemoryUsage();
            const cacheMemoryUsage = getMemoryUsageDifference(startMemoryUsage, endMemoryUsage);
            const cachedUsersLength = Object.keys(this.cache.users).length;
            if (cachedUsersLength > 0 && Array.isArray(Object.values(this.cache.users))) {
              // update cache object
              // tslint:disable-next-line: max-line-length
              this.cache = { ...this.cache, lastUpdate: Date.now(), totalRecords: recordsFound, elapsedTime, status: result.status, memoryUsage: { cache: cacheMemoryUsage, system: endMemoryUsage } };
              // get paginatorResult: used for debug purposes only
              // const paginatorResult = paginator(Object.values(this.cache.users), 1, 100);
              // Logger.log(`paginatorResult: [${JSON.stringify(paginatorResult, undefined, 2)}]`);
              // resolve promise
              resolve({
                lastUpdate: this.cache.lastUpdate,
                totalRecords: this.cache.totalRecords,
                elapsedTime: this.cache.elapsedTime,
                memoryUsage: this.cache.memoryUsage,
                status: this.cache.status
              });
            } else {
              reject({ message: `records not found, cached not initialized`, status: result.status });
            }
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
  getUserRecords = (searchUserRecordsDto: SearchUserRecordsDto): Promise<SearchUserPaginatorResponseDto> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.cache.lastUpdate) {
          throw new Error('cache not yet initialized! first initialize cache and try again');
        } else {
          // convert record to array before duty
          const recordArray = recordToArray(this.cache.users);
          const filtered = await filterator(recordArray, searchUserRecordsDto.searchAttributes);
          const paginatorResult = await paginator(filtered, searchUserRecordsDto.page, searchUserRecordsDto.perPage);
          resolve({ ...paginatorResult });
        }
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
        // tslint:disable-next-line: max-line-length
        displayName: (createLdapUserDto.displayName) ? createLdapUserDto.displayName : `${createLdapUserDto.firstName}${createLdapUserDto.lastName ? ` ${createLdapUserDto.lastName}` : ''}`,
        // class that has custom attributes ex "objectClass": "User"
        objectclass: createLdapUserDto.objectClass ? createLdapUserDto.objectClass : UserObjectClass.USER,
        unicodePwd: encodeAdPassword(createLdapUserDto.password),
        sAMAccountName: createLdapUserDto.username,
        userAccountControl: UserAccountControl.NORMAL_ACCOUNT
      };

      // optionals must be included outside the above object, otherwise the following error is shown {"error":"Cannot read property 'toString' of null"}
      if (createLdapUserDto.lastName)
        newUser.sn = createLdapUserDto.lastName;
      if (createLdapUserDto.mail)
        newUser.mail = createLdapUserDto.mail;
      if (createLdapUserDto.dateOfBirth)
        newUser.dateOfBirth = createLdapUserDto.dateOfBirth;
      if (createLdapUserDto.gender)
        newUser.gender = createLdapUserDto.gender;
      if (createLdapUserDto.telephoneNumber)
        newUser.telephoneNumber = createLdapUserDto.telephoneNumber;
      if (createLdapUserDto.studentID)
        newUser.studentID = createLdapUserDto.studentID;

      try {
        // ex cn=root,c3administrator,ou=People,dc=c3edu,dc=online
        // ex cn=user,c3student,ou=People,dc=c3edu,dc=online
        const newDN = `cn=${cn},ou=${createLdapUserDto.defaultGroup},${this.configService.get(e.LDAP_NEW_USER_DN_POSTFIX)},${this.configService.get(e.LDAP_BASE_DN)}`;
        this.ldapClient.add(newDN, newUser, async (error) => {
          if (error) {
            reject(error);
          } else {
            // update cache
            await this.updateCachedUser(UpdateCacheOperation.CREATE, cn);
            // must add new user to group after update cache, it can crash if group doesn't exists
            await this.addOrDeleteUserToGroup(ChangeUserRecordOperation.ADD, { username: newUser.cn, group: createLdapUserDto.defaultGroup })
              .catch((error) => {
                reject(error);
              });
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
   * add or delete group/role to user/member
   */
  addOrDeleteUserToGroup(dn: ChangeUserRecordOperation, addUserToGroupDto: AddOrDeleteUserToGroupDto): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const changeDN = `cn=${addUserToGroupDto.group},ou=Groups,${this.configService.get(e.LDAP_BASE_DN)}`;
        // Todo we must opt for on group here, to work when we create a user or when we add a member to group
        const searchGroup = (addUserToGroupDto.defaultGroup) ? addUserToGroupDto.defaultGroup : addUserToGroupDto.group;
        // search by member
        const member = `cn=${addUserToGroupDto.username},ou=${searchGroup},ou=People,${this.configService.get(e.LDAP_BASE_DN)}`;
        const groupChange = new ldap.Change({
          operation: dn,
          modification: {
            member,
          }
        });
        this.ldapClient.modify(changeDN, groupChange, async (error) => {
          if (error) {
            reject(error);
          } else {
            // update cache
            await this.updateCachedUser(UpdateCacheOperation.UPDATE, addUserToGroupDto.username);
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * update defaultGroup
   */
  updateDefaultGroup(changeDefaultGroupDto: ChangeDefaultGroupDto): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const user: SearchUserRecordDto = (await this.getUserRecord(changeDefaultGroupDto.username)).user;
        const newDn: string = `cn=${changeDefaultGroupDto.username},ou=${changeDefaultGroupDto.defaultGroup},ou=People,${this.configService.get(e.LDAP_BASE_DN)}`;

        this.ldapClient.modifyDN(user.dn, newDn, async (error) => {
          if (error)
            return reject(error);

          await this.updateCachedUser(UpdateCacheOperation.UPDATE, changeDefaultGroupDto.username).catch((error) => {reject(error);});

          const defaultGroupDn: string = `cn=${changeDefaultGroupDto.defaultGroup},ou=groups,${this.configService.get(e.LDAP_BASE_DN)}`.toLowerCase();
          const notMember: boolean = user.memberOf.filter((group: string) => {return group.toLowerCase()==defaultGroupDn;}).length==0;
          if (notMember)
            await this.addOrDeleteUserToGroup(ChangeUserRecordOperation.ADD,{ username: changeDefaultGroupDto.username, group: changeDefaultGroupDto.defaultGroup}).catch((error) => {reject(error);});

          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * delete user
   */
  deleteUserRecord(deleteUserRecordDto: DeleteUserRecordDto): Promise<void> {
    return new Promise((resolve, reject) => {
      const delDN = `cn=${deleteUserRecordDto.username},ou=${deleteUserRecordDto.defaultGroup},${this.configService.get(e.LDAP_NEW_USER_DN_POSTFIX)},${this.configService.get(e.LDAP_BASE_DN)}`;
      try {
        this.ldapClient.del(delDN, async (error) => {
          if (error) {
            reject(error);
          } else {
            // update cache
            await this.updateCachedUser(UpdateCacheOperation.DELETE, deleteUserRecordDto.username);
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
   */
  changeUserRecord(changeUserRecordDto: ChangeUserRecordDto): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const changeDN = `cn=${changeUserRecordDto.username},ou=${changeUserRecordDto.defaultGroup},${this.configService.get(e.LDAP_NEW_USER_DN_POSTFIX)},${this.configService.get(e.LDAP_BASE_DN)}`;
        // map array of changes to ldap.Change
        const changes = changeUserRecordDto.changes.map((change: ldap.Change) => {
          if (change.modification.unicodePwd)
            change.modification.unicodePwd=encodeAdPassword(change.modification.unicodePwd);

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

  /**
   * change user password
   */
  changeUserProfilePassword(username: string, changeUserPasswordDto: ChangeUserPasswordDto): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const changeDN = `cn=${username},ou=${changeUserPasswordDto.defaultGroup},${this.configService.get(e.LDAP_NEW_USER_DN_POSTFIX)},${this.configService.get(e.LDAP_BASE_DN)}`;
        if (!changeUserPasswordDto.oldPassword || !changeUserPasswordDto.newPassword) {
          throw new Error('you must pass a valid oldPassword and newPassword properties')
        }
        if (changeUserPasswordDto.oldPassword === changeUserPasswordDto.newPassword) {
          throw new Error('oldPassword and newPassword are equal')
        }
        // map array of changes to ldap.Change
        const changes = [
          new ldap.Change({
            operation: 'delete',
            modification: {
              unicodePwd: encodeAdPassword(changeUserPasswordDto.oldPassword)
            }
          }),
          new ldap.Change({
            operation: 'add',
            modification: {
              unicodePwd: encodeAdPassword(changeUserPasswordDto.newPassword)
            }
          })
        ];
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
