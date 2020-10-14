import { IsDefined } from 'class-validator';
import { User } from '../models';

export class LoginUserResponseDto {
  @IsDefined()
  user: User;

  @IsDefined()
  accessToken: string;
}
