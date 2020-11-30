import { IsDefined, Length } from 'class-validator';

export class DeleteUserRecordDto {
  @IsDefined()
  @Length(3, 50)
  // ldap: name
  username: string;
}
