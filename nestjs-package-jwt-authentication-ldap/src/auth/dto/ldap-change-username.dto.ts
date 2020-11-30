export interface LdapChangeUsernameDto {
  username: string;
  operation: 'add';
  // you can pass in a single Change or an array of Change objects
  modifications: [{
    [key: string]: any;
  }];
}
