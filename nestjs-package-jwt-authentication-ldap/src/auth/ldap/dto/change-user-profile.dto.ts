import * as ldap from 'ldapjs';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Length } from 'class-validator';

export class ChangeUserProfileDto {
  // defaultGroup is the group that is defined on createUser and will be in dn
  // ex "dn": "CN=user,OU=${defaultGroup},OU=People,DC=c3edu,DC=online"
  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  defaultGroup: string;

  @IsDefined()
  @ApiProperty()
  changes: ldap.Change[];
}
