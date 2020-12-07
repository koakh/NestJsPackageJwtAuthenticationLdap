import { MemoryUsage } from '../../common/interfaces';
import { SearchUserRecordDto } from '../ldap/dto';

export interface Cache {
  // last update initialized date
  lastUpdate: number,
  total: number,
  status: number,
  // hashMap of cached users
  users: Record<string, SearchUserRecordDto>,
  elapsedTime: number,
  memoryUsage: {
    // used in cache
    cache: MemoryUsage,
    // used in system, after cache users
    system :MemoryUsage,
  },
}
