// TODO: NOT USED
import { IsNumber, Max, Min } from 'class-validator';

export class PaginationDto {
  @Min(0)
  @IsNumber()
  skip: number = 0;

  @Min(1)
  @Max(100)
  @IsNumber()
  take: number = 25;
}
