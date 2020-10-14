import { IsDefined, IsEmail, IsOptional, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsDefined()
  @Length(4,20)
  username: string;

  @IsDefined()
  @Length(4,20)
  password: string;

  @IsDefined()
  @MaxLength(40)
  firstName: string;

  @IsDefined()
  @MaxLength(40)
  lastName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  metaData: any;
}
