import { SearchUserRecordDto } from './search-user-record.dto';

export interface InitUserRecordsCacheResponseDto {
  total: number,
  elapsedTime: number,
  memoryUsage: any,
  status: number,
  // optional: used only for debug purposes
  data?: SearchUserRecordDto[],
}
