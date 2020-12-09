

import { IsDefined, Length } from 'class-validator';

export class AddDeleteUserToGroupDto {
  @IsDefined()
  @Length(3, 50)
  username: string;

  @IsDefined()
  @Length(3, 50)
  group: string;
}
