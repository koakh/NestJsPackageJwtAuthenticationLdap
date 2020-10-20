export interface LdapSearchUsernameResponseDto {
  user: {
    username: string,
    dn: string,
    email: string,
    memberOf: string[],
    controls: string[],
  },
  status: number;
}