import { IsDefined, Length } from 'class-validator';

export class ChangeUserPasswordDto {
  @IsDefined()
  @Length(3, 50)
  oldPassword: string;

  @IsDefined()
  @Length(3, 50)
  newPassword: string;
}
