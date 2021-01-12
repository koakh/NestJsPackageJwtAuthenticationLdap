import { ApiProperty } from "@nestjs/swagger/dist/decorators";

export class CreateCatDto {
  @ApiProperty({ default: 'Fritz' })
  name: string;

  @ApiProperty({ default: 28 })
  age: number;

  @ApiProperty({ default: 'Abyssinian Cat' })
  breed: string;

  /**
   * A list of user's roles
   * @example ['admin']
   */
  @ApiProperty({
    description: `A list of user's roles`,
    example: ['admin'],
  })
  roles: string[];
}