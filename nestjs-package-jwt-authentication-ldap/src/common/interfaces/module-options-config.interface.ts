export interface ModuleOptionsConfig {
  auth: {
    authShowAccessTokenProps: boolean;
    authSecretKey: string;
    accessTokenJwtSecret: string | { (): string };
    refreshTokenJwtSecret: string | { (): string };
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
    refreshTokenSkipIncrementVersion: boolean;
    roleAdmin: string;
    rolePermittedUnlicensedPermissionGroups: string;
    developerGroup: string;
    developerAccessTokenExpiresIn: string;
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
    searchGroupProfilesPrefix: string;
    searchGroupPermissionsPrefix: string;
    searchGroupExcludeProfileGroups: string;
    searchGroupExcludePermissionGroups: string;
    searchCacheFilter: string;
    newUserDnPostfix: string;
  }
}
