import * as ldap from 'ldapjs';

export interface ChangeUserRecordDto {
  changes: ldap.Change[];
}
