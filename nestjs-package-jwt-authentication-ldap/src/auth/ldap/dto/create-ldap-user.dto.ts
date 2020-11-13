import { IsDefined, IsEmail, IsNumber, IsOptional, Length, Min } from 'class-validator';

export class CreateLdapUserDto {
  @IsDefined()
  @Length(3, 50)
  // ldap: name
  username: string;

  @IsDefined()
  @Length(3, 50)
  password: string;

  // firstName
  @IsDefined()
  @Length(3, 50)
  // ldap: givenname
  firstName: string;

  // lastName
  @IsDefined()
  @Length(3, 50)
  // ldap: sn
  lastName: string;

  // firstName + lastName, if omitted automatically combine `firstName + lastName`
  @IsOptional()
  displayName: string;

  @Length(3, 50)
  objectClass: string;

  @IsOptional()
  jpegPhoto?: string;

  @IsOptional()
  @IsEmail()
  mail?: string;

  // description: Date of birth (format YYYYMMDD, only numeric chars)
  @IsOptional()
  @IsNumber()
  dateOfBirth?: number

  @IsOptional()
  @Length(1)
  gender?: 'M' | 'F' | 'm' | 'f';

  @IsOptional()
  @Length(3, 50)
  telephoneNumber?: string;

  @IsOptional()
  @Length(3, 50)
  studentID?: string;
}
