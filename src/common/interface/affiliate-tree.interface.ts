import { ApiProperty } from '@nestjs/swagger';

export class AffiliateTreeNode {
  @ApiProperty({ example: 'uuid-123', description: 'Affiliate ID' })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'Affiliate name' })
  name: string;

  @ApiProperty({
    example: 'johndoe@email.com',
    description: 'Affiliate email',
    required: false,
  })
  email?: string;

  @ApiProperty({
    example: 1,
    description: 'Affiliate level',
    enum: [1, 2, 3, 4],
  })
  level: number;

  @ApiProperty({ example: 1500.75, description: 'Total earned' })
  totalEarned: number;

  @ApiProperty({
    example: 'active',
    description: 'Affiliate status',
    required: false,
  })
  status?: string;

  @ApiProperty({
    example: 'uuid-parent',
    description: 'Parent affiliate ID',
    required: false,
  })
  parentId?: string | null;

  @ApiProperty({
    type: () => [AffiliateTreeNode],
    description: 'Child affiliates',
    default: [],
  })
  children: AffiliateTreeNode[];
}
