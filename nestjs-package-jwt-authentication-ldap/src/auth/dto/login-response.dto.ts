import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

// TODO seems that this DTO don't work in swagger
export class LoginResponseDto {
  @IsDefined()
  @ApiProperty()
  user: {
    dn: string
    username: string | string[],
    email: string,
    roles: string[],
    permissions: string[],
    metaData?: any,
  };

  @IsDefined()
  @ApiProperty()
  accessToken: string;
}