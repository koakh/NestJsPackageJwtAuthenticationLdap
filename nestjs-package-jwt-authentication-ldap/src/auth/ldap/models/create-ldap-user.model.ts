import { IsDefined, Length, IsOptional, IsEmail, Min, isEmail, IsNumber } from 'class-validator';
import { UserAccountControl } from '../enums';

export class CreateLdapUserModel {
  // distinguishedName
  // @IsDefined()
  // dn: string;

  // username
  // @IsDefined()
  // @Length(4,20)
  // name : string;

  // firstName
  @IsDefined()
  @Min(4)
  givenname?: string;

  // firstName + lastName
  @IsDefined()
  @Min(4)
  displayName?: string;
  
  @IsDefined()
  @Min(3)
  cn: string;

  @IsDefined()
  @Min(4)
  name: string;

  // lastName
  @IsDefined()
  @Min(4)
  sn: string;

  // @IsOptional()
  // @IsEmail()
  // userPrincipalName: string;

  @IsDefined()
  @Min(4)
  objectclass: string;

  @IsDefined()
  @Min(4)
  // userPassword: string;
  unicodePwd: string;

  // ldap: name
  // the use id, ex what appears has key with `samba-tool user list`
  @IsDefined()
  @Length(4, 20)
  sAMAccountName: string;

  @IsDefined()
  userAccountControl: UserAccountControl;

  // optionals
  @IsOptional()
  @IsEmail()
  mail: string;

  // description: Date of birth (format YYYYMMDD, only numeric chars)
  @IsOptional()
  @IsNumber()
  dateOfBirth?: number

  // gender
  // telephoneNumber
  // studentID
}
