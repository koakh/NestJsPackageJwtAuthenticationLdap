import { IsDefined, IsOptional, Max, Min } from 'class-validator';
import { FilteratorSearchFieldAttribute } from '../interfaces';

export class SearchUserRecordsRequestDto {
  @IsDefined()
  @Min(1)
  page: number;

  @Min(25)
  @Max(100)
  @IsOptional()
  perPage: number;

  @IsOptional()
  searchAttributes?: Array<FilteratorSearchFieldAttribute>
}
