import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty({
    description: 'Sale amount in USD',
    example: 1000.5,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Sale description',
    example: 'Premium subscription - Annual plan',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
