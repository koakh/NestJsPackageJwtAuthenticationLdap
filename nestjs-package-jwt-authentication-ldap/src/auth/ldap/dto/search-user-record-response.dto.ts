import { SearchUserRecordDto } from './search-user-record.dto';

/**
 * must match LDAP_SEARCH_ATTRIBUTES properties
 */
export interface SearchUserRecordResponseDto {
  user: SearchUserRecordDto,
  status: number;
}
