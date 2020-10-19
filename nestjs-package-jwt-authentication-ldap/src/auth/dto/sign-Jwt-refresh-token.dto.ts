import { SignJwtTokenDto } from './sign-Jwt-token.dto';

export interface SignJwtRefreshTokenDto extends SignJwtTokenDto {
  tokenVersion: number,
}