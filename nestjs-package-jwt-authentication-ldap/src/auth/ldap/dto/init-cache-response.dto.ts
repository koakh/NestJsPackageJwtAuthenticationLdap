export interface InitCacheResponseDto extends Cache {
  lastUpdate: number,
  total: number,
  elapsedTime: number,
  memoryUsage: any,
  status: number,
}
