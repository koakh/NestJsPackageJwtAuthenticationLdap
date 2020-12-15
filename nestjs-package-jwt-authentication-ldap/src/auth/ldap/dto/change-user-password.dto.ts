import { IsDefined, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserPasswordDto {
  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  oldPassword: string;

  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  newPassword: string;
}
