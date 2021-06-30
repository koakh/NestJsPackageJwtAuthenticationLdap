import { IsDefined, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserPasswordDto {
  // defaultGroup is the group that is defined on createUser and will be in dn
  // ex "dn": "CN=user,OU=${defaultGroup},OU=People,DC=c3edu,DC=online"
  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  defaultGroup: string;

  @IsDefined()
  @Length(4, 50)
  @ApiProperty()
  oldPassword: string;

  @IsDefined()
  @Length(4, 50)
  @ApiProperty()
  newPassword: string;
}
