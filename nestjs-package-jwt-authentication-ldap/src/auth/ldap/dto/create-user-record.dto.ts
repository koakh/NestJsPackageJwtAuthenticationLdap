import { IsDefined, IsEmail, IsNumber, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRecordDto {
  @IsDefined()
  @Length(3, 50)
  // ldap: name
  @ApiProperty()
  username: string;

  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  password: string;

  // firstName
  @IsDefined()
  @Length(3, 50)
  // ldap: givenname
  @ApiProperty()
  firstName: string;

  // lastName
  @IsDefined()
  @Length(3, 50)
  // ldap: sn
  @ApiProperty()
  lastName: string;

  // defaultGroup is the group that is defined on createUser and will be in dn
  // ex "dn": "CN=user,OU=${defaultGroup},OU=People,DC=c3edu,DC=online"
  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  defaultGroup: string;

  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  objectClass: string;

  // firstName + lastName, if omitted automatically combine `firstName + lastName`
  @IsOptional()
  @ApiProperty()
  displayName: string;

  @IsOptional()
  @ApiProperty()
  jpegPhoto?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty()
  mail?: string;

  // description: Date of birth (format YYYYMMDD, only numeric chars)
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  dateOfBirth?: number

  @IsOptional()
  @Length(1)
  @ApiProperty()
  gender?: 'M' | 'F' | 'm' | 'f';

  @IsOptional()
  @Length(3, 50)
  @ApiProperty()
  telephoneNumber?: string;

  @IsOptional()
  @Length(3, 50)
  @ApiProperty()
  studentID?: string;
}
