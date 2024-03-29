import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class SearchGroupRecordDto {
  @IsDefined()
  @ApiProperty()
  dn: string;

  @IsDefined()
  @ApiProperty()
  cn: string;

  @IsDefined()
  @ApiProperty()
  name: string;

  @IsDefined()
  @ApiProperty()
  objectCategory: string;

  @IsDefined()
  @ApiProperty()
  distinguishedName: string;

  @IsDefined()
  @ApiProperty()
  permissions: any;
}
