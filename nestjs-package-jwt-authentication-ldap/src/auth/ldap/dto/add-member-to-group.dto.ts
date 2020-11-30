

import { IsDefined, Length } from 'class-validator';

export class AddUserToGroupDto {
  @IsDefined()
  @Length(3, 50)
  username: string;

  @IsDefined()
  @Length(3, 50)
  group: string;
}
