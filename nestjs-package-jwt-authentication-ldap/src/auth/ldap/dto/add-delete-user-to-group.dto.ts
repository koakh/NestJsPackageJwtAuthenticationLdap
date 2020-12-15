import { IsDefined, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddDeleteUserToGroupDto {
  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  username: string;

  @IsDefined()
  @Length(3, 50)
  @ApiProperty()
  group: string;
}
