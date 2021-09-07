import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { SearchGroupRecordDto } from './search-group-record.dto';

/**
 * must match LDAP_SEARCH_GROUP_ATTRIBUTES properties
 */
export class SearchGroupRecordResponseDto {
  @IsDefined()
  @ApiProperty()
  groups: SearchGroupRecordDto[];

  @IsDefined()
  @ApiProperty()
  status: number;
}
