// En commissions.controller.ts o donde definas tus schemas

import { ApiProperty } from '@nestjs/swagger';

export class CommissionResponseDto {
  @ApiProperty({
    description: 'Commission ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Commission level (1, 2, or 3)',
    example: 1,
    enum: [1, 2, 3],
  })
  level: number;

  @ApiProperty({
    description: 'Commission percentage (10, 5, or 2.5)',
    example: 10,
    enum: [10, 5, 2.5],
  })
  percentage: number;

  @ApiProperty({
    description: 'Commission amount',
    example: 100.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Sale ID that generated this commission',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  saleId: string;

  @ApiProperty({
    description: 'Commission status',
    example: 'pending',
    enum: ['pending', 'paid'],
  })
  status: string;

  @ApiProperty({
    description: 'Created date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;
}
