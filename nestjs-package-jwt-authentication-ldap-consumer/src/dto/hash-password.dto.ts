import { ApiProperty } from "@nestjs/swagger/dist/decorators";

export class HashPasswordDto {
  @ApiProperty({ default: 'secret' })
  password: string;
}