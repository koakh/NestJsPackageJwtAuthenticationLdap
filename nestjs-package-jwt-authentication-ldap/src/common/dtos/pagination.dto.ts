// TODO: NOT USED
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class PaginationDto {
  @Min(0)
  @IsNumber()
  @ApiProperty()
  skip: number = 0;

  @Min(1)
  @Max(100)
  @IsNumber()
  @ApiProperty()
  take: number = 25;
}
