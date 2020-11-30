export interface LdapSearchUsernameDto {
  dn: string;
  memberOf: string[];
  controls: string[];
  objectCategory: string;
  userAccountControl: string;
  lastLogonTimestamp: string;
  // cd
  username: string;
  // userPrincipalName
  email: string;
  displayName: string;
  gender: string;
  mail: string;
  C3UserRole: string;
  dateOfBirth: string;
  studentID: string;
}
