export interface LdapLoginResponseDto {
  user: {
    username: string | string[],
    email: string,
    roles: string[],
    metaData?: any,
  },
  accessToken: string,
}