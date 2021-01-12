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

  // firstName + lastName, if omitted automatically combine `firstName + lastName`
  @IsOptional()
  @ApiProperty()
  displayName: string;

  @Length(3, 50)
  @ApiProperty()
  objectClass: string;

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
