export interface LoginRequestDto {
  user: {
    dn: string,
    cn: string,
    userPrincipalName: string,
    controls: any[],
    memberOf: string[],
  }
}