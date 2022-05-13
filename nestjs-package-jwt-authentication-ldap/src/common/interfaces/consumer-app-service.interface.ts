import { AddOrDeleteUserToGroupDto, ChangeDefaultGroupDto, ChangeUserRecordDto, CreateGroupRecordDto, CreateUserRecordDto, DeleteGroupRecordDto, DeleteUserRecordDto, SearchUserRecordDto } from '../../auth/ldap/dto';
import { ChangeUserRecordOperation } from '../../auth/ldap/enums';
import { JwtSecrets } from './jwt-secrets.interface';

export interface ConsumerAppService {
  getWelcome: (name: string) => string;
  licenseState: () => any;
  initRenewTokenSecrets(): JwtSecrets;
  getJwtSecrets: () => JwtSecrets;
  singleSignOn?: (req: any, res: any) => any;
  changePassword?: (username: string, password: string) => any;
  // inject on users cache
  injectMetadataCache?: (entry: SearchUserRecordDto) => any;
  // inject on auth token
  injectMetadataToken?: (entry: SearchUserRecordDto) => any;
  // events
  onCreateUserRecord?: (createLdapUserDto: CreateUserRecordDto) => void;
  onChangeUserRecord?: (changeUserRecordDto: ChangeUserRecordDto) => void;
  onDeleteUserRecord?: (deleteUserRecordDto: DeleteUserRecordDto) => void;
  onAddOrDeleteUserToGroup?: (operation: ChangeUserRecordOperation, addUserToGroupDto: AddOrDeleteUserToGroupDto) => void;
  onChangeUserProfilePassword?: (username: string) => void; 
  onUpdateDefaultGroup?: (changeDefaultGroupDto: ChangeDefaultGroupDto) => void;
  onCreateGroupRecord?: (createLdapGroupDto: CreateGroupRecordDto) => void;
  onDeleteGroupRecord?: (deleteGroupRecordDto: DeleteGroupRecordDto) => void;
}