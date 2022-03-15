import { IsDefined } from 'class-validator';
import { SearchUserRecordDto } from './search-user-record.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SearchUserPaginatorResponseDto {
  @IsDefined()
  @ApiProperty()
  page: number;

  @IsDefined()
  @ApiProperty()
  perPage: number;

  @IsDefined()
  @ApiProperty()
  prePage: number;

  @IsDefined()
  @ApiProperty()
  nextPage: number;
  totalRecords: number;

  @IsDefined()
  @ApiProperty()
  totalPages: number;

  @IsDefined()
  @ApiProperty()
  data: SearchUserRecordDto[];
}
