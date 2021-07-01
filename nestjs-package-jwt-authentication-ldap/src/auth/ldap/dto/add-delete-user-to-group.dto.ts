import { IsDefined, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddOrDeleteUserToGroupDto {
  @IsDefined()
  @Length(1, 50)
  @ApiProperty()
  username: string;

  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  group: string;

  // optional used when add member to group only
  @Length(3, 50)
  @ApiProperty()
  defaultGroup?: string;
}
