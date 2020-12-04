import { SearchUserPaginatorResponseDto } from './search-user-paginator-response.dto';

export interface InitUserRecordsCacheResponseDto  extends SearchUserPaginatorResponseDto {
  timeTaken: number,
  status: number,
}
