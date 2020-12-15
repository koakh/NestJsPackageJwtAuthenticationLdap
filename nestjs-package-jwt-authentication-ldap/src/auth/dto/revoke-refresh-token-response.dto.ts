import { IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevokeRefreshTokenResponseDto {
  @IsDefined()
  @ApiProperty()
  version: number;
}
