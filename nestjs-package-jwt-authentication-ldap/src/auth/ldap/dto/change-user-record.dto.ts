import * as ldap from 'ldapjs';

export interface ChangeUserRecordDto {
  // username: string;
  changes: ldap.Change[];
  // TODO: clean up bellow codeBlock
  // you can pass in a single Change or an array of Change objects
  // changes: [{
  //   operation: ChangeUserRecordOperation;
  //   modifications: {
  //     [key: string]: any;
  //   };
  // }]
}
