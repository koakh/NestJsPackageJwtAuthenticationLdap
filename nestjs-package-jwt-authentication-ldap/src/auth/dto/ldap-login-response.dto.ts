export interface LdapLoginResponseDto {
  user: {
    username: string,
    email: string,
    roles: string[],
    metaData: any,
  },
  accessToken: string,
}