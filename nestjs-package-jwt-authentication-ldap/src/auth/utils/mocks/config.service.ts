import { envConstants } from '../../../common/constants/env';

export const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'JWT_EXPIRATION_TIME':
        return '3600'
      case 'REFRESH_TOKEN_SKIP_INCREMENT_VERSION':
        return 'true'
      case envConstants.LDAP_SEARCH_BASE:
        return 'ou=Test,dc=c3edu,dc=online'
      case envConstants.LDAP_SEARCH_USER_ATTRIBUTES:
        return 'cn,userPrincipalName'
      case envConstants.REFRESH_TOKEN_SKIP_INCREMENT_VERSION:
        return true;
    }
  }
}