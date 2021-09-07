import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Length } from 'class-validator';

export class DeleteGroupRecordDto {
  @IsDefined()
  @Length(1, 50)
  @ApiProperty()
  groupName: string;
}
