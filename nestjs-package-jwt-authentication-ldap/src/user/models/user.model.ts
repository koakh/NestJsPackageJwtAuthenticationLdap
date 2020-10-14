import { IsArray, IsDefined, IsEmail, IsNumber, IsObject, IsOptional, IsUUID, Length, MaxLength } from 'class-validator';
import { UserModelInterface } from '../interfaces';

export class User implements UserModelInterface {
  @IsDefined()
  @IsUUID()
  id: string;

  @IsDefined()
  @Length(4, 20)
  username: string;

  @IsDefined()
  @Length(4, 20)
  password: string;

  @IsDefined()
  @MaxLength(40)
  firstName: string;

  @IsDefined()
  @MaxLength(40)
  lastName: string;

  @IsDefined()
  @IsEmail()
  email: string;

  @IsArray()
  roles?: string[];

  // extra interface property
  @IsDefined()
  @IsNumber()
  createdDate: number;

  // extra interface property
  @IsOptional()
  @IsObject()
  metaData?: any;
}
