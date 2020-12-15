import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Max, Min } from 'class-validator';
import { FilteratorSearchFieldAttribute } from '../interfaces';

export class SearchUserRecordsDto {
  @Min(1)
  @IsOptional()
  @ApiProperty()
  page?: number;

  @Min(25)
  @Max(100)
  @IsOptional()
  @ApiProperty()
  perPage?: number;

  @IsOptional()
  @ApiProperty()
  searchAttributes?: Array<FilteratorSearchFieldAttribute>
}
