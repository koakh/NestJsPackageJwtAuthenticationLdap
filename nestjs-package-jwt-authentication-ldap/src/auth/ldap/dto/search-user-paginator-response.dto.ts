import { SearchUserRecordDto } from './search-user-record.dto';
import { SearchUserRecordsRequestDto } from './search-user-records-request.dto';

export interface SearchUserPaginatorResponseDto {
  page: number;
  perPage: number;
  prePage: number;
  nextPage: number;
  totalRecords: number;
  totalPages: number;
  data: SearchUserRecordDto[];
  // searchAttributes: SearchUserRecordsRequestDto;
}
