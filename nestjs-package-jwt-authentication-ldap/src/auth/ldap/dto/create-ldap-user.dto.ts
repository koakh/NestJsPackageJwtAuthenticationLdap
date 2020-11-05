import { IsDefined, IsEmail, IsOptional, Length } from 'class-validator';

export class CreateLdapUserDto {
  // @IsDefined()
  // distinguishedName : string;

  @IsDefined()
  @Length(4,20)
  // ldap: name
  username : string;

  @IsDefined()
  @Length(6,28)
  password: string;

  // firstName
  @IsDefined()
  @Length(4,20)
  // ldap: givenname
  firstName: string;

  // lastName
  @IsDefined()
  @Length(4,20)
  // ldap: sn
  lastName: string;

  @IsOptional()
  @IsEmail()
  // ldap: userPrincipalName
  email: string;

  @Length(4,20)
  objectClass: string;
}
