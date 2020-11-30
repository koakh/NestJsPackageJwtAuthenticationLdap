import { LdapSearchUsernameDto } from './ldap-search-username.dto';

/**
 * must match LDAP_SEARCH_ATTRIBUTES properties
 */
export interface LdapSearchUsernameResponseDto {
  user: LdapSearchUsernameDto,
  status: number;
}
