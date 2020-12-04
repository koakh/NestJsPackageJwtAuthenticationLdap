import { SearchUserRecordDto } from './search-user-record.dto';

/**
 * must match LDAP_SEARCH_ATTRIBUTES properties
 */
export interface SearchUserRecordsResponseDto {
  users: SearchUserRecordDto[],
  status: number;
  timeTaken: number;
}
