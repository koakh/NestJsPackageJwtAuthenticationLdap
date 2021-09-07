import { IsDefined, Length } from 'class-validator';

export class CreateLdapGroupModel {
  @IsDefined()
  @Length(1, 50)
  cn: string;

  @IsDefined()
  @Length(1, 50)
  name: string;

  @IsDefined()
  @Length(3, 50)
  objectclass: string;

  @IsDefined()
  @Length(3, 50)
  sAMAccountName: string;
}
