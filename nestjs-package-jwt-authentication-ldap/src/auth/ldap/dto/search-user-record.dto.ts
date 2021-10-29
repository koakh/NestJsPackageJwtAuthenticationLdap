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
  extraPermission?: string[];

  @IsDefined()
  @ApiProperty()
  controls: string[];

  @IsDefined()
  @ApiProperty()
  objectCategory: string;

  @IsDefined()
  @ApiProperty()
  distinguishedName: string;

  @IsDefined()
  @ApiProperty()
  userAccountControl: string;

  @IsDefined()
  @ApiProperty()
  lastLogonTimestamp: string;

  @IsDefined()
  @ApiProperty()
  cn: string;

  @IsDefined()
  @ApiProperty()
  givenName: string;

  @IsDefined()
  @ApiProperty()
  sn: string;

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
  c3UserRole: string;

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
