import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional, Length } from 'class-validator';

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

  @IsOptional()
  @ApiProperty({ default: false })
  // this will force a activated license device, and always get all permissions even when device is not activated
  forceActivatedLicense: boolean;

  // WARN: this object will be extended ldap by passport strategy
  user: {
    dn: string,
    cn: string,
    userPrincipalName: string,
    controls: any[],
    memberOf: string[],
    extraPermission: string[],
  };
}
