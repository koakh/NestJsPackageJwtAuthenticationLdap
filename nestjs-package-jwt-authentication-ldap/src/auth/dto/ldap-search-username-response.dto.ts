export interface LdapSearchUsernameResponseDto {
  user: {
    username: string,
    dn: string,
    email: string,
    roles: string[],
    controls: string[],
  },
  status: number;
}