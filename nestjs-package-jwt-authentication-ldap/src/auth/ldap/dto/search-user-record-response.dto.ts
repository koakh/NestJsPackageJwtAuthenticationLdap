import { IsDefined } from 'class-validator';
import { SearchUserRecordDto } from './search-user-record.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * must match LDAP_SEARCH_USER_ATTRIBUTES properties
 */
export class SearchUserRecordResponseDto {
  @IsDefined()
  @ApiProperty()
  user: SearchUserRecordDto;

  @IsDefined()
  @ApiProperty()
  status: number;
}
