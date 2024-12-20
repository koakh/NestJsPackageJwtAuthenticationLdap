import { JwtSecrets, SearchUserRecordDto } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { ConsumerAppService as ConsumerAppServiceInterface, AddOrDeleteUserToGroupDto, ChangeDefaultGroupDto, ChangeUserRecordDto, CreateGroupRecordDto, CreateUserRecordDto, DeleteGroupRecordDto, DeleteUserRecordDto } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { ChangeUserRecordOperation } from '@koakh/nestjs-package-jwt-authentication-ldap/dist/auth/ldap/enums';
import { Injectable, Logger } from '@nestjs/common';
import { randomSecret } from '../utils';

@Injectable()
export class ConsumerAppService implements ConsumerAppServiceInterface {
  // inMemory jwtSecrets
  private jwtSecrets: JwtSecrets;

  constructor() {
    this.initRenewTokenSecrets();
  }

  // test function
  getWelcome(name: string) {
    return `hello ${name}`;
  }

  // proxy function to injected licenseService
  async licenseState() {
    // used tru or false to force activate or un-activated device
    // used only in c3-updater, here we can always respond with licenseActivated: true
    return { licenseActivated: true };
  }

  initRenewTokenSecrets(): JwtSecrets {
    this.jwtSecrets = {
      accessTokenJwtSecret: randomSecret(),
      refreshTokenJwtSecret: randomSecret(),
    };
    return this.jwtSecrets;
  }

  // stub to implement
  getJwtSecrets(): JwtSecrets {
    return this.jwtSecrets;
  }

  // stub to implement
  // singleSignOn(req: any, res: any): any {
  //   return {};
  // }

  // stub to implement
  changePassword(username: string, password: string): any {
    return { username, password };
  }

  // comment fn to disabled and test no-implementation
  injectMetadataCache(entry: SearchUserRecordDto): any {
    return { someProp: `injected some property on cache entry ${entry.cn}` };
  }

  // comment fn to disabled and test no-implementation
  injectMetadataToken(entry: SearchUserRecordDto): any {
    return { someProp: `injected some property on token entry ${entry.cn}` };
  }

  // events

  // stub to implement
  onCreateUserRecord(createLdapUserDto: CreateUserRecordDto): void {
    Logger.log(`fired onCreateUserRecord event for user '${createLdapUserDto.cn}'`);
  }

  // stub to implement
  onChangeUserRecord(changeUserRecordDto: ChangeUserRecordDto): void {
    Logger.log(`fired onChangeUserRecord event for user '${changeUserRecordDto.cn}'`);
  }
  
  // stub to implement
  onDeleteUserRecord(deleteUserRecordDto: DeleteUserRecordDto): void {
    Logger.log(`fired onDeleteUserRecord event for user '${deleteUserRecordDto.cn}'`);
  }

  // stub to implement
  onAddOrDeleteUserToGroup(operation: ChangeUserRecordOperation, addUserToGroupDto: AddOrDeleteUserToGroupDto): void {
    Logger.log(`fired onAddOrDeleteUserToGroup event for user '${addUserToGroupDto.cn}' group '${addUserToGroupDto.group}' operation '${operation}'`);
  }

  // stub to implement
  onChangeUserProfilePassword(username: string): void {
    Logger.log(`fired onChangeUserProfilePassword event for user '${username}'`);
  }

  // stub to implement
  onUpdateDefaultGroup(changeDefaultGroupDto: ChangeDefaultGroupDto): void {
    Logger.log(`fired onUpdateDefaultGroup event for user '${changeDefaultGroupDto.cn}' group '${changeDefaultGroupDto.group}'`);
  }

  // stub to implement
  onCreateGroupRecord(createLdapGroupDto: CreateGroupRecordDto): void {
    Logger.log(`fired onCreateGroupRecord event for group '${createLdapGroupDto.groupName}'`);
  }

  // stub to implement
  onDeleteGroupRecord(deleteGroupRecordDto: DeleteGroupRecordDto): void {
    Logger.log(`fired onDeleteGroupRecord event for group '${deleteGroupRecordDto.groupName}'`);
  }

}
