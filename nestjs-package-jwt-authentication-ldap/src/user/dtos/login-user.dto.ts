import { IsDefined, Length } from 'class-validator';

export class LoginUserDto {
  @IsDefined()
  @Length(4,20)
  username: string;

  @IsDefined()
  @Length(4,20)
  password: string;
}
