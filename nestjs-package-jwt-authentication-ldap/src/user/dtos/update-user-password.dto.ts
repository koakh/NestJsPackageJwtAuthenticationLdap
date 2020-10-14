import { IsDefined, Length } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsDefined()
  @Length(4,20)
  password: string;
}
