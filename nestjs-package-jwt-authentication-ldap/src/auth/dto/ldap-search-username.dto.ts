export interface LdapSearchUsernameDto {
  user: {
    username: string,
    email: string,
    roles: string[],
    controls: string[],
  },
  status: number;
}