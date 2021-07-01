import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class SearchUserRecordDto {
  @IsDefined()
  @ApiProperty()
  dn: string;

  @IsDefined()
  @ApiProperty()
  memberOf: string[];

  @IsDefined()
  @ApiProperty()
  controls: string[];

  @IsDefined()
  @ApiProperty()
  objectCategory: string;

  @IsDefined()
  @ApiProperty()
  userAccountControl: string;

  @IsDefined()
  @ApiProperty()
  lastLogonTimestamp: string;

  // cd
  @IsDefined()
  @ApiProperty()
  username: string;

  @IsDefined()
  @ApiProperty()
  firstName: string;

  @IsDefined()
  @ApiProperty()
  lastName: string;

  // userPrincipalName
  @IsDefined()
  @ApiProperty()
  email: string;

  @IsDefined()
  @ApiProperty()
  displayName: string;

  @IsDefined()
  @ApiProperty()
  gender: string;

  @IsDefined()
  @ApiProperty()
  mail: string;

  @IsDefined()
  @ApiProperty()
  C3UserRole: string;

  @IsDefined()
  @ApiProperty()
  dateOfBirth: string;

  @IsDefined()
  @ApiProperty()
  studentID: string;

  @IsDefined()
  @ApiProperty()
  telephoneNumber: string;
}
