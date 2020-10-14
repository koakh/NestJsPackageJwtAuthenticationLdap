import { IsArray, IsDefined, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
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

  @IsArray()
  @IsOptional()
  roles?: string[];
}
