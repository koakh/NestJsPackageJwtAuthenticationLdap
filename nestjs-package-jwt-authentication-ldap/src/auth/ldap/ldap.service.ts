import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ldap from 'ldapjs';
import { Client } from 'ldapjs';
import { paramCase } from 'param-case';
import { pascalCase } from 'pascal-case';
import { CONFIG_SERVICE, CONSUMER_APP_SERVICE } from '../../common/constants';
import { ModuleOptionsConfig } from '../../common/interfaces';
import { asyncForEach, filterator, getMemoryUsage, getMemoryUsageDifference, insertItemInArrayAtPosition, paginator, recordToArray } from '../../common/utils/util';
import { addExtraPropertiesToGetUserRecords, encodeAdPassword, filterLdapGroup, getCnFromDn, getProfileFromFirstMemberOf, getProfileFromMemberOf, includeLdapGroup, parseTemplate, sortObjectByKey } from '../utils';
// tslint:disable-next-line: max-line-length
import { AddOrDeleteUserToGroupDto, CacheResponseDto, ChangeDefaultGroupDto, ChangeUserPasswordDto, ChangeUserRecordDto, CreateGroupRecordDto, CreateUserRecordDto, DeleteGroupRecordDto, DeleteUserRecordDto, SearchGroupRecordDto, SearchGroupRecordResponseDto, SearchUserPaginatorResponseDto, SearchUserRecordDto, SearchUserRecordResponseDto, SearchUserRecordsDto } from './dto';
import { ChangeUserRecordOperation, GroupTypeOu, Objectclass, UpdateCacheOperation, UserAccountControl, UserObjectClass } from './enums';
import { Cache } from './interfaces';
import { CreateLdapGroupModel, CreateLdapUserModel } from './models';
import { ConsumerAppService } from '../../common/interfaces';

/**
 * user model
 * https://bitbucket.org/criticallinksteam/c3/src/develop/src/backend/userModel.js
 */

@Injectable()
export class LdapService {
  private ldapClient: Client;
  private searchBase: string;
  private searchUserFilter: string;
  private searchUserAttributes: string[];
  private searchGroupFilter: string;
  private searchCacheFilter: string;
  private searchGroupAttributes: string[];
  private searchGroupProfilesPrefix: string;
  private searchGroupPermissionsPrefix: string;
  private searchGroupExcludeProfileGroups: string[];
  private searchGroupExcludePermissionGroups: string[];
  private newUserDnPostfix: string;
  private baseDN: string;
  private cache: Cache;

  constructor(
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
    @Inject(CONSUMER_APP_SERVICE)
    private readonly consumerAppService: ConsumerAppService,
  ) {
    // init ldapServer
    this.init(config);
    // init cache object
    this.cache = {
      lastUpdate: undefined,
      totalRecords: undefined,
      elapsedTime: undefined,
      memoryUsage: undefined,
      status: undefined,
      users: {},
    };
  }

  // called by GqlLocalAuthGuard
  async init(config: ModuleOptionsConfig): Promise<any> {
    const clientOptions: ldap.ClientOptions = {
      url: `ldap://${this.config.ldap.address}:${this.config.ldap.port}`,
      bindDN: this.config.ldap.bindDN,
      bindCredentials: this.config.ldap.bindCredentials,
      // required to prevent lost connections with ldap after preDefined time
      // check note `Samba-LDAP: Shell Commands and Tips Extended.md > ### Samba MaxConnIdleTime Lower times to debug problem`
      reconnect: true,
    };
    // props
    this.searchBase = this.config.ldap.searchBase;
    this.searchUserFilter = this.config.ldap.searchUserFilter;
    this.searchUserAttributes = this.config.ldap.searchUserAttributes.toString().split(',');
    this.searchCacheFilter = this.config.ldap.searchCacheFilter;
    this.searchGroupFilter = this.config.ldap.searchGroupFilter;
    this.searchGroupAttributes = this.config.ldap.searchGroupAttributes.toString().split(',');
    this.searchGroupProfilesPrefix = this.config.ldap.searchGroupProfilesPrefix;
    this.searchGroupPermissionsPrefix = this.config.ldap.searchGroupPermissionsPrefix;
    this.searchGroupExcludeProfileGroups = this.config.ldap.searchGroupExcludeProfileGroups.toString().split(',');
    this.searchGroupExcludePermissionGroups = this.config.ldap.searchGroupExcludePermissionGroups.toString().split(',');
    this.newUserDnPostfix = this.config.ldap.newUserDnPostfix;
    this.baseDN = this.config.ldap.baseDN;

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
            key = (Object.keys(this.cache.users) as Array<string>).find((key) => this.cache.users[key].cn === username);
            // Logger.log(`this.cache.users[username]:${JSON.stringify(this.cache.users[key], undefined, 2)}`, LdapService.name)
            // update user in cache, always get it from ldap to double check that it is inSync
            this.cache.users[key] = (await this.getUserRecord(username)).user;
            break;
          case UpdateCacheOperation.DELETE:
            key = (Object.keys(this.cache.users) as Array<string>).find((key) => this.cache.users[key].cn === username);
            // remove user from cache, we need a filteredUsers array helper
            const filteredUsers: Record<string, SearchUserRecordDto> = {};
            recordToArray(this.cache.users).forEach((e: SearchUserRecordDto) => {
              if (e.cn != username) {
                // add to filteredUsers
                filteredUsers[e.cn] = e;
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
    });
  }

  getUserRecord = (username: string): Promise<SearchUserRecordResponseDto> => {
    return new Promise((resolve, reject) => {
      try {
        // let user: { username: string, dn: string, email: string, memberOf: string[], controls: string[] };
        let user: SearchUserRecordDto;
        const filter = parseTemplate(this.searchUserFilter, { username });
        // note to work we must use the scope sub else it won't work
        this.ldapClient.search(this.searchBase, {
          attributes: this.searchUserAttributes,
          scope: 'sub',
          filter,
        }, (err, res) => {
          // this.ldapClient.search(this.searchBase, { filter: this.searchFilter, attributes: this.searchAttributes }, (err, res) => {
          if (err) Logger.log(err);
          res.on('searchEntry', (entry) => {
            // Logger.log(`entry.object: [${JSON.stringify(entry.object, undefined, 2)}]`);
            const memberOf = (typeof entry.object.memberOf === 'string')
              ? [entry.object.memberOf]
              : entry.object.memberOf;
            user = {
              // extract username from string | array
              dn: entry.object.dn as string,
              // if only have on group we must convert ldap string to array to ve consistent
              c3UserRole: entry.object.C3UserRole as string,
              cn: entry.object.cn as string,
              controls: entry.object.controls as string[],
              dateOfBirth: entry.object.dateOfBirth as string,
              displayName: entry.object.displayName as string,
              distinguishedName: entry.object.distinguishedName as string,
              email: entry.object.userPrincipalName as string,
              extraPermission: (typeof entry.object.extraPermission === 'string') ? [entry.object.extraPermission] : entry.object.extraPermission,
              gender: entry.object.gender as string,
              givenName: entry.object.givenName as string,
              lastLogonTimestamp: entry.object.lastLogonTimestamp as string,
              mail: entry.object.mail as string,
              memberOf,
              objectCategory: entry.object.objectCategory as string,
              sn: entry.object.sn as string,
              studentID: entry.object.studentID as string,
              telephoneNumber: entry.object.telephoneNumber as string,
              userAccountControl: entry.object.userAccountControl as string,
              // injected onTheFly prop
              metaData: {
                profile: getProfileFromMemberOf(memberOf[0]),
              }
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
              : reject({ message: 'user not found', status: result.status });
          });
        });
      } catch (error) {
        // Logger.error(`error: [${error.message}]`, LdapService.name);
        // reject promise
        reject(error);
      }
    });
  };

  /**
   * init/update inMemory cache
   */
  initUserRecordsCache = (
    // if empty in payload use default
    filter: string,
    pageSize = 1000,
  ): Promise<CacheResponseDto> => {
    return new Promise((resolve, reject) => {
      const showDebug = false;
      try {
        // if filter is undefined, use default filter
        filter = filter ? filter : this.searchCacheFilter;
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
          attributes: this.searchUserAttributes,
          scope: 'sub',
          filter,
          paged: {
            pageSize,
            pagePause: true,
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
            const memberOf = (typeof entry.object.memberOf === 'string')
              ? [entry.object.memberOf]
              : entry.object.memberOf;
            user = {
              // extract username from string | array
              dn,
              memberOf: memberOf,
              extraPermission: (typeof entry.object.extraPermission === 'string') ? [entry.object.extraPermission] : entry.object.extraPermission,
              controls: entry.object.controls as string[],
              objectCategory: entry.object.objectCategory as string,
              distinguishedName: entry.object.distinguishedName as string,
              userAccountControl: entry.object.userAccountControl as string,
              lastLogonTimestamp: entry.object.lastLogonTimestamp as string,
              cn: entry.object.cn as string,
              givenName: entry.object.givenName as string,
              sn: entry.object.sn as string,
              email: entry.object.userPrincipalName as string,
              displayName: entry.object.displayName as string,
              gender: entry.object.gender as string,
              mail: entry.object.mail as string,
              c3UserRole: entry.object.C3UserRole as string,
              dateOfBirth: entry.object.dateOfBirth as string,
              studentID: entry.object.studentID as string,
              telephoneNumber: entry.object.telephoneNumber as string,
              // injected onTheFly prop
              metaData: {
                profile: getProfileFromMemberOf(memberOf[0]),
              }
            };
            // add user to inMemoryUsers with dn key
            this.cache.users[dn] = user;
          });
          res.on('page', (result, onPageCallback) => {
            // push to pages
            currentPage++;
            // assign only if null
            if (!recordsFound && result.controls && result.controls[0]) { recordsFound = result.controls[0]._value.size; }
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
            if (onPageCallback) { onPageCallback(); }
          });
          res.on('error', (error) => {
            reject(error);
          });
          res.on('end', (result: ldap.LDAPResult) => {
            // benchMark and memoryUsage
            const parseHrtimeToSeconds = (hrtime) => {
              const seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
              return seconds;
            };
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
                status: this.cache.status,
              });
            } else {
              reject({ message: 'records not found, cached not initialized', status: result.status });
            }
          });
        });
      } catch (error) {
        // Logger.error(`error: [${error.message}]`, LdapService.name);
        // reject promise
        reject(error);
      }
    });
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
          const filteredExcludedGroups = filterLdapGroup(filtered, this.searchGroupExcludeProfileGroups);
          let filteredUsersCn = filteredExcludedGroups;
          if (searchUserRecordsDto.searchUsersCn) {
            // override default filteredUsersCn
            filteredUsersCn = filteredExcludedGroups.filter((e: SearchUserRecordDto) => searchUserRecordsDto.searchUsersCn.includes(e.cn));
          }
          const sortedArray = searchUserRecordsDto.sortBy ? sortObjectByKey(filteredUsersCn, searchUserRecordsDto.sortBy, searchUserRecordsDto.sortDirection) : filteredExcludedGroups;
          const paginatorResult = await paginator(sortedArray, searchUserRecordsDto.page, searchUserRecordsDto.perPage);
          // extended with extra properties like customUsersBaseSearch when we detect that are used a custom OU like OU=School1
          const data = addExtraPropertiesToGetUserRecords(paginatorResult.data);
          resolve({ ...paginatorResult, data });
        }
      } catch (error) {
        // Logger.error(`error: [${error.message}]`, LdapService.name);
        // reject promise
        reject(error);
      }
    });
  };

  createUserRecord(createLdapUserDto: CreateUserRecordDto): Promise<string> {
    return new Promise((resolve, reject) => {
      // outside of try, catch must have access to entry object
      const username = paramCase(createLdapUserDto.cn);
      const cn = username;
      const newUser: CreateLdapUserModel = {
        cn,
        name: username,
        givenName: createLdapUserDto.givenName,
        // tslint:disable-next-line: max-line-length
        displayName: (!createLdapUserDto.displayName && (createLdapUserDto.sn && createLdapUserDto.sn))
          ? `${createLdapUserDto.givenName} ${createLdapUserDto.sn}`
          : createLdapUserDto.displayName,
        // class that has custom attributes ex "objectClass": "User"
        objectclass: createLdapUserDto.objectClass ? createLdapUserDto.objectClass : UserObjectClass.USER,
        unicodePwd: encodeAdPassword(createLdapUserDto.unicodePwd),
        sAMAccountName: username,
        userAccountControl: UserAccountControl.NORMAL_ACCOUNT,
      };

      // optionals must be included outside the above object, otherwise the following error is shown {"error":"Cannot read property 'toString' of null"}
      if (createLdapUserDto.sn)
        newUser.sn = createLdapUserDto.sn;
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
        const newDN = `cn=${cn},ou=${createLdapUserDto.defaultGroup},${this.newUserDnPostfix},${this.baseDN}`;
        this.ldapClient.add(newDN, newUser, async (error) => {
          if (error) {
            reject(error);
          } else {
            // update cache
            await this.updateCachedUser(UpdateCacheOperation.CREATE, cn);
            // must add new user to group after update cache, it can crash if group doesn't exists
            await this.addOrDeleteUserToGroup(ChangeUserRecordOperation.ADD, { cn: newUser.cn, defaultGroup: createLdapUserDto.defaultGroup, group: createLdapUserDto.defaultGroup })
              .catch((error) => {
                reject(error);
              });
            resolve(username);
            // fire event
            if (typeof this.consumerAppService.onCreateUserRecord === 'function') {
              this.consumerAppService.onCreateUserRecord();
            }
          }
        });
      } catch (error) {
        // const message = (error && error.name === 'InvalidDistinguishedNameError')
        //   ? { message: parseTemplate(c.INVALID_DISTINGUISHED_NAME_ERROR, createLdapUserDto), newUser }
        //   : error;
        reject(error);
      }
    });
  }

  /**
   * add or delete group/role to user/member
   */
  addOrDeleteUserToGroup(operation: ChangeUserRecordOperation, addUserToGroupDto: AddOrDeleteUserToGroupDto): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const changeGroupDN = `CN=${addUserToGroupDto.group},OU=Profiles,OU=Groups,${this.baseDN}`;
        // Todo we must opt for on group here, to work when we create a user or when we add a member to group
        const searchGroup = addUserToGroupDto.defaultGroup;
        // search by member
        const member = `CN=${addUserToGroupDto.cn},OU=${searchGroup},OU=People,${this.baseDN}`;
        const groupChange = new ldap.Change({
          operation: operation,
          modification: {
            member,
          },
        });
        this.ldapClient.modify(changeGroupDN, groupChange, async (error) => {
          if (error) {
            reject(error);
          } else {
            // update cache
            await this.updateCachedUser(UpdateCacheOperation.UPDATE, addUserToGroupDto.cn);
            // fire event
            if (typeof this.consumerAppService.onAddOrDeleteUserToGroup === 'function') {
              this.consumerAppService.onAddOrDeleteUserToGroup();
            }
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * update defaultGroup
   */
  updateDefaultGroup(changeDefaultGroupDto: ChangeDefaultGroupDto): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const user: SearchUserRecordDto = (await this.getUserRecord(changeDefaultGroupDto.cn)).user;
        const newDn = `CN=${changeDefaultGroupDto.cn},OU=${changeDefaultGroupDto.group},OU=People,${this.baseDN}`;
        const newDefaultGroup = `CN=${changeDefaultGroupDto.group},OU=Profiles,OU=Groups,${this.baseDN}`;
        const oldDefaultGroup = `CN=${changeDefaultGroupDto.defaultGroup},OU=Profiles,OU=Groups,${this.baseDN}`;
        const isNotDefaultGroup = !(user.memberOf && user.memberOf.length > 0 && user.memberOf[0] === oldDefaultGroup);
        if (isNotDefaultGroup) {
          // must replace user.memberOf[0] with default group, leaving all other groups un-touched
          // for this we must delete all groups and recreate memberOf array starting with default group and continue with all others
          let addGroups = [];
          if (user.memberOf && user.memberOf.length > 0) {
            // remove all members
            await asyncForEach(user.memberOf, async (e) => {
              // add if not new defaultGroup or oldDefaultGroup
              if (e.toLowerCase() !== newDefaultGroup.toLowerCase() && e.toLowerCase() !== oldDefaultGroup.toLowerCase()) {
                addGroups.push(e);
              };
              const member = getProfileFromMemberOf(e);
              await this.addOrDeleteUserToGroup(ChangeUserRecordOperation.DELETE, { cn: changeDefaultGroupDto.cn, defaultGroup: changeDefaultGroupDto.defaultGroup, group: member })
                .catch((error) => {
                  throw (error);
                });
            });
          };
          // always add new defaultGroupDn to index 0 position
          addGroups = insertItemInArrayAtPosition(addGroups, 0, newDefaultGroup);
          // add all members
          await asyncForEach(addGroups, async (e) => {
            const member = getProfileFromMemberOf(e);
            await this.addOrDeleteUserToGroup(ChangeUserRecordOperation.ADD, { cn: changeDefaultGroupDto.cn, defaultGroup: changeDefaultGroupDto.defaultGroup, group: member })
              .catch((error) => {
                throw (error);
              });
          });
        };
        // the last thing to do is change userDn, else we cant't search it in above block code
        this.ldapClient.modifyDN(user.dn, newDn, async (error) => {
          if (error) {
            return reject(error);
          }
        });
        // now update cached user
        await this.updateCachedUser(UpdateCacheOperation.UPDATE, changeDefaultGroupDto.cn).catch((error) => {
          throw (error);
        });
        // resolve if reach here
        resolve();
        // fire event
        if (typeof this.consumerAppService.onUpdateDefaultGroup === 'function') {
          this.consumerAppService.onUpdateDefaultGroup();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * delete user
   */
  deleteUserRecord(deleteUserRecordDto: DeleteUserRecordDto): Promise<void> {
    return new Promise((resolve, reject) => {
      const delDN = `cn=${deleteUserRecordDto.cn},ou=${deleteUserRecordDto.defaultGroup},${this.newUserDnPostfix},${this.baseDN}`;
      try {
        this.ldapClient.del(delDN, async (error) => {
          if (error) {
            reject(error);
          } else {
            // update cache
            await this.updateCachedUser(UpdateCacheOperation.DELETE, deleteUserRecordDto.cn);
            resolve();
            // fire event
            if (typeof this.consumerAppService.onDeleteUserRecord === 'function') {
              this.consumerAppService.onDeleteUserRecord();
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * change user record
   */
  changeUserRecord(changeUserRecordDto: ChangeUserRecordDto): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const changeUserDN = `cn=${changeUserRecordDto.cn},ou=${changeUserRecordDto.defaultGroup},${this.newUserDnPostfix},${this.baseDN}`;
        let password: string = null;

        // map and override changes
        const changes = changeUserRecordDto.changes.map((change: ldap.Change) => {
          // detect and override properties
          if ('unicodePwd' in change.modification) {
            // must override unicodePwd properties
            password = change.modification.unicodePwd;
            change.modification.unicodePwd = encodeAdPassword(change.modification.unicodePwd);
            // Logger.debug(`change.modification.unicodePwd: [${change.modification.unicodePwd}]`, LdapService.name);
          }
          return new ldap.Change({
            operation: change.operation,
            modification: change.modification,
          });
        });

        if (password)
          await this.consumerAppService.changePassword(changeUserRecordDto.cn, password);

        // apply changes
        this.ldapClient.modify(changeUserDN, changes, async (error) => {
          if (error) {
            reject(error);
          } else {
            await this.updateCachedUser(UpdateCacheOperation.UPDATE, changeUserRecordDto.cn);
            resolve();
            // fire event
            if (typeof this.consumerAppService.onChangeUserRecord === 'function') {
              this.consumerAppService.onChangeUserRecord();
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * change user password
   */
  changeUserProfilePassword(username: string, changeUserPasswordDto: ChangeUserPasswordDto): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const changeUserDN = `cn=${username},ou=${changeUserPasswordDto.defaultGroup},${this.newUserDnPostfix},${this.baseDN}`;
        if (!changeUserPasswordDto.oldPassword || !changeUserPasswordDto.newPassword) {
          throw new Error('you must pass a valid oldPassword and newPassword properties');
        }
        if (changeUserPasswordDto.oldPassword === changeUserPasswordDto.newPassword) {
          throw new Error('oldPassword and newPassword are equal');
        }

        await this.consumerAppService.changePassword(username, changeUserPasswordDto.newPassword);

        // map array of changes to ldap.Change
        const changes = [
          new ldap.Change({
            operation: 'delete',
            modification: {
              unicodePwd: encodeAdPassword(changeUserPasswordDto.oldPassword),
            },
          }),
          new ldap.Change({
            operation: 'add',
            modification: {
              unicodePwd: encodeAdPassword(changeUserPasswordDto.newPassword),
            },
          }),
        ];
        this.ldapClient.modify(changeUserDN, changes, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
            // fire event
            if (typeof this.consumerAppService.onChangeUserProfilePassword === 'function') {
              this.consumerAppService.onChangeUserProfilePassword();
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
  * create group
  */
  createGroupRecord(createLdapGroupDto: CreateGroupRecordDto): Promise<string> {
    return new Promise((resolve, reject) => {
      const groupName = createLdapGroupDto.groupName.startsWith(this.searchGroupProfilesPrefix)
        ? createLdapGroupDto.groupName
        : `${this.searchGroupProfilesPrefix}${pascalCase(createLdapGroupDto.groupName)}`;
      const cn = groupName;
      const newGroup: CreateLdapGroupModel = {
        cn,
        name: groupName,
        objectclass: Objectclass.GROUP,
        sAMAccountName: groupName,
      };

      try {
        const newDN = `cn=${groupName},ou=Profiles,ou=Groups,${this.baseDN}`;
        this.ldapClient.add(newDN, newGroup, async (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(groupName);
            // fire event
            if (typeof this.consumerAppService.onCreateGroupRecord === 'function') {
              this.consumerAppService.onCreateGroupRecord();
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * delete group
   */
  deleteGroupRecord(deleteGroupRecordDto: DeleteGroupRecordDto): Promise<void> {
    return new Promise((resolve, reject) => {
      const delDN = `cn=${deleteGroupRecordDto.groupName},ou=Profiles,ou=Groups,${this.baseDN}`;
      // dn: CN=newGroup,CN=Users,DC=c3edu,DC=online
      try {
        this.ldapClient.del(delDN, async (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
            // fire event
            if (typeof this.consumerAppService.onDeleteGroupRecord === 'function') {
              this.consumerAppService.onDeleteGroupRecord();
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * must match LDAP_SEARCH_USER_ATTRIBUTES properties
   */
  //  export class SearchGroupRecordResponseDto {

  getGroupRecord = (groupName: string, groupType: GroupTypeOu, groupExcludeGroups: boolean): Promise<SearchGroupRecordResponseDto> => {
    return new Promise((resolve, reject) => {
      const showDebug = false;
      const groups: SearchGroupRecordDto[] = [];

      try {
        // let user: { username: string, dn: string, email: string, memberOf: string[], controls: string[] };
        let group: SearchGroupRecordDto;
        const filter = groupName ? parseTemplate(this.searchGroupFilter, { groupName }) : undefined;
        // note to work we must use the scope sub else it won't work
        // this.ldapClient.search(this.searchBase, { attributes: this.searchAttributes, scope: 'sub', filter: `(cn=${groupName})` }, (err, res) => {
        this.ldapClient.search(`ou=${groupType},ou=Groups,${this.baseDN}`, {
          attributes: this.searchGroupAttributes,
          scope: 'sub',
          filter: groupName ? filter : undefined,
        }, (err, res) => {
          // this.ldapClient.search(this.searchBase, { filter: this.searchFilter, attributes: this.searchAttributes }, (err, res) => {
          if (err) Logger.log(err);
          res.on('searchEntry', (entry) => {
            const dn = entry.object.dn as string;
            // exclude groupType names ex Profiles and Permissions, they will by find by OU=Groups,DC=c3edu,DC=online filter
            // ex KO dn:'OU=Permissions,OU=Groups,DC=c3edu,DC=online'
            // ex OK dn:'CN=RPUpdate,OU=Permissions,OU=Groups,DC=c3edu,DC=online'
            if (entry.object.name.toString().toLowerCase() != groupType) {
              // Logger.log(`entry.object: [${JSON.stringify(entry.object, undefined, 2)}]`);
              if (showDebug) {
                Logger.log(`entry.object ${groupType}: [${JSON.stringify(entry.object, undefined, 2)}]`);
              }
              group = {
                dn,
                cn: entry.object.cn as string,
                name: entry.object.name as string,
                objectCategory: entry.object.objectCategory as string,
                distinguishedName: entry.object.distinguishedName as string,
                permissions: entry.object.permission,
              };
              // profiles
              if (groupType === GroupTypeOu.PROFILES) {
                // if not a exclude group push it to result array
                if (groupExcludeGroups) {
                  if (includeLdapGroup(entry.object.name as string, this.searchGroupProfilesPrefix, this.searchGroupExcludeProfileGroups)) {
                    groups.push(group);
                  }
                } else {
                  groups.push(group);
                }
              }
              // TODO: permissions this is USED
              if (groupType === GroupTypeOu.PERMISSIONS) {
                // if not a exclude group push it to result array
                if (includeLdapGroup(entry.object.name as string, this.searchGroupPermissionsPrefix, this.searchGroupExcludePermissionGroups)) {
                  groups.push(group);
                }
              }
            }
          });
          res.on('error', (error) => {
            throw error;
          });
          res.on('end', (result: ldap.LDAPResult) => {
            // Logger.log(`status: [${result.status}]`, LdapService.name);
            groups
              ? resolve({ groups, status: result.status })
              : reject({ message: 'group not found', status: result.status });
          });
        });
      } catch (error) {
        // Logger.error(`error: [${error.message}]`, LdapService.name);
        // reject promise
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
