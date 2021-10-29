import * as ldap from 'ldapjs';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { DeleteUserRecordDto } from './delete-user-record.dto';

export class ChangeUserRecordDto extends DeleteUserRecordDto {
  @IsDefined()
  @ApiProperty()
  changes: ldap.Change[];
}
