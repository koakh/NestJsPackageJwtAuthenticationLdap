import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Length } from 'class-validator';

// TODO seems that this DTO don't work in swagger
export class LoginDto {
  @IsDefined()
  @Length(3, 50)
  @ApiProperty({ default: 'root' })
  username: string;

  @IsDefined()
  @Length(3, 50)
  @ApiProperty({ default: 'pass' })
  password: string;

  // WARN: this object will be extended ldap by passport strategy
  user: {
    dn: string,
    cn: string,
    userPrincipalName: string,
    controls: any[],
    memberOf: string[],
  }
}
