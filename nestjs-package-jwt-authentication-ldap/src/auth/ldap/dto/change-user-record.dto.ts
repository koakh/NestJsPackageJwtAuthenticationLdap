import * as ldap from 'ldapjs';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class ChangeUserRecordDto {
  @IsDefined()
  @ApiProperty()
  changes: ldap.Change[];
}
