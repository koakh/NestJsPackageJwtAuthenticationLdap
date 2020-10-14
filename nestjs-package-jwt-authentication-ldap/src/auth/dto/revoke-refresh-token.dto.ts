import { IsDefined } from 'class-validator';

export class RevokeRefreshTokenDto {
  @IsDefined()
  version: number;
}
