// src/affiliates/interfaces/affiliate-tree.interface.ts
import { ApiProperty } from '@nestjs/swagger';

export class AffiliateTreeNode {
  @ApiProperty({ example: 'uuid-123', description: 'Affiliate ID' })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'Affiliate name' })
  name: string;

  @ApiProperty({ example: 1, description: 'Affiliate level', enum: [1, 2, 3] })
  level: number;

  @ApiProperty({ example: 1500.75, description: 'Total earned' })
  totalEarned: number;

  @ApiProperty({
    type: () => [AffiliateTreeNode],
    description: 'Child affiliates',
    default: [],
  })
  children: AffiliateTreeNode[];
}

export class AffiliateTreeResponse {
  @ApiProperty({ type: AffiliateTreeNode })
  tree: AffiliateTreeNode;
}
