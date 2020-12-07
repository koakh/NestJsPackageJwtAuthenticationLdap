import { SearchUserRecordDto } from '../ldap/dto';

export interface CacheStatus {
  total: number,
  elapsedTime: number,
  memoryUsage: any,
  status: number,
  users: Record<string, SearchUserRecordDto>
}
