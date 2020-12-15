import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class CacheResponseDto {
  @IsDefined()
  @ApiProperty()
  lastUpdate: number;

  @IsDefined()
  @ApiProperty()
  totalUsers: number;

  @IsDefined()
  @ApiProperty()
  elapsedTime: number;

  @IsDefined()
  @ApiProperty()
  memoryUsage: any;

  @IsDefined()
  @ApiProperty()
  status: number;
}
