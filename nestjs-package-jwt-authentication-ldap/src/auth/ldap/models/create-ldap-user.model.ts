import { IsDefined, IsEmail, IsNumber, IsOptional, Length, Min } from 'class-validator';
import { UserAccountControl } from '../enums';

export class CreateLdapUserModel {
  @IsDefined()
  @Length(1, 50)
  cn: string;

  @IsDefined()
  @Length(1, 50)
  name: string;

  @IsDefined()
  @Length(1, 50)
  givenName: string;

  // firstName + lastName
  @IsDefined()
  @Length(1, 50)
  displayName: string;

  @IsDefined()
  @Length(3, 50)
  objectclass: string;

  @IsDefined()
  @Length(3, 50)
  unicodePwd: string;

  @IsOptional()
  jpegPhoto?: string;

  // ldap: name
  // the use id, ex what appears has key with `samba-tool user list`
  @IsDefined()
  @Length(3, 50)
  sAMAccountName: string;

  @IsDefined()
  userAccountControl: UserAccountControl;

  // optionals

  // lastName
  @IsOptional()
  @Min(1)
  sn?: string;

  @IsOptional()
  @IsEmail()
  mail?: string;

  // description: Date of birth (format YYYYMMDD, only numeric chars)
  @IsOptional()
  @IsNumber()
  dateOfBirth?: number

  @IsOptional()
  @Length(1)
  gender?: string;

  @IsOptional()
  @Length(3, 50)
  telephoneNumber?: string;

  @IsOptional()
  @Length(3, 50)
  studentID?: string;
}
