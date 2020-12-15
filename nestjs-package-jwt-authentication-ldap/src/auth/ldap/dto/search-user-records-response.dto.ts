import { SearchUserRecordDto } from './search-user-record.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

/**
 * must match LDAP_SEARCH_ATTRIBUTES properties
 */
export class SearchUserRecordsResponseDto {
  @IsDefined()
  @ApiProperty()
  users: SearchUserRecordDto[];

  @IsDefined()
  @ApiProperty()
  status: number;
  
  @IsDefined()
  @ApiProperty()
  timeTaken: number;
}
