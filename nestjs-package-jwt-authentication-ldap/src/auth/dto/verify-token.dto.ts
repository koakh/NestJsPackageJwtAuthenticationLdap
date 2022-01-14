import { IsDefined } from 'class-validator';

// TODO seems that this DTO don't work in swagger
export class VerifyTokenDto {
  @IsDefined()
  accessToken: string;
}
