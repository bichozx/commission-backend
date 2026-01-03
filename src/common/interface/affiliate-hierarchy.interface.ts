// src/affiliates/interfaces/affiliate-hierarchy.interface.ts
import { ApiProperty } from '@nestjs/swagger';

export class AffiliateBasicInfo {
  @ApiProperty({ example: 'uuid-123', description: 'Affiliate ID' })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'Affiliate name' })
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Affiliate email' })
  email: string;

  @ApiProperty({ example: 1, description: 'Affiliate level', enum: [1, 2, 3] })
  level: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Join date',
  })
  joinDate: Date;

  @ApiProperty({ example: 1500.75, description: 'Total earned' })
  totalEarned: number;

  @ApiProperty({
    example: 'active',
    description: 'Affiliate status',
    enum: ['active', 'inactive'],
  })
  status: string;

  @ApiProperty({ example: 10, description: 'Commission rate percentage' })
  commissionRate: number;
}

export class HierarchyLevelInfo {
  @ApiProperty({ example: 'uuid-456', description: 'Affiliate ID' })
  id: string;

  @ApiProperty({ example: 'Jane Smith', description: 'Affiliate name' })
  name: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Affiliate email' })
  email: string;

  @ApiProperty({
    example: 10,
    description: 'Commission percentage for this level',
    enum: [10, 5, 2.5],
  })
  commissionPercentage: number;

  @ApiProperty({
    example: '2023-12-01T08:15:00.000Z',
    description: 'Join date',
  })
  joinDate: Date;

  @ApiProperty({
    example: 2500.5,
    description: 'Total earned by this affiliate',
  })
  totalEarned: number;
}

export class DownlineAffiliateInfo {
  @ApiProperty({ example: 'uuid-789', description: 'Affiliate ID' })
  id: string;

  @ApiProperty({ example: 'Robert Johnson', description: 'Affiliate name' })
  name: string;

  @ApiProperty({
    example: 'robert@example.com',
    description: 'Affiliate email',
  })
  email: string;

  @ApiProperty({ example: 2, description: 'Affiliate level', enum: [1, 2, 3] })
  level: number;

  @ApiProperty({
    example: '2024-01-20T14:45:00.000Z',
    description: 'Join date',
  })
  joinDate: Date;

  @ApiProperty({ example: 500.25, description: 'Total earned' })
  totalEarned: number;
}

export class AffiliateHierarchyResponse {
  @ApiProperty({ type: AffiliateBasicInfo })
  current: AffiliateBasicInfo;

  @ApiProperty({ type: HierarchyLevelInfo, required: false })
  level1?: HierarchyLevelInfo;

  @ApiProperty({ type: HierarchyLevelInfo, required: false })
  level2?: HierarchyLevelInfo;

  @ApiProperty({ type: HierarchyLevelInfo, required: false })
  level3?: HierarchyLevelInfo;

  @ApiProperty({
    type: [DownlineAffiliateInfo],
    description: 'Direct downline affiliates (those you referred directly)',
  })
  directDownline: DownlineAffiliateInfo[];

  @ApiProperty({
    example: 5,
    description:
      'Total number of affiliates in your downline (including indirect)',
  })
  totalDownlineCount: number;
}
