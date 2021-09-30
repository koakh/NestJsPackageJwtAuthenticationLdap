export interface ModuleOptionsConfig {
  jwt: {
    accessTokenJwtSecret: string;
    accessTokenExpiresIn: string;
    refreshTokenJwtSecret: string;
    refreshTokenExpiresIn: string;
    refreshTokenSkipIncrementVersion: string;
  },
  ldap: {
    address: string;
    port: string | number;
    usersBaseSearch: string;
    baseDN: string;
    baseAdmin: string;
    bindDN: string;
    rootUser: string;
    bindCredentials: string;
    searchBase: string;
    searchUserFilterStrategy: string;
    searchUserFilter: string;
    searchUserAttributes: string;
    searchGroupFilter: string;
    searchGroupAttributes: string;
    searchGroupPrefix: string;
    searchGroupExcludeGroups: string;
    searchGroupExcludeRolesGroups: string;
    searchGroupExcludePermissionsGroups: string;
    searchCacheFilter: string;
    newUserDnPostfix: string;
    roleAdmin: string;
  }
}
