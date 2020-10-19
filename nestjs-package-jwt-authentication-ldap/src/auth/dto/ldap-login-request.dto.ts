export interface LdapLoginRequestDto {
  user: {
    dn: string,
    cn: string,
    userPrincipalName: string,
    distinguishedName: string;
    controls: any[],
    memberOf: string[],
  }
}