import { SearchUserRecordDto } from './search-user-record.dto';

export interface SearchUserPaginatorResponseDto {
  page: number,
  perPage: number,
  prePage: number,
  nextPage: number,
  total: number,
  totalPages: number,
  data: SearchUserRecordDto[],
}
