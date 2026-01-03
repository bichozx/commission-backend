// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class AffiliatesService {}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Affiliate } from './entities/affiliate.entity';
import {
  AffiliateBasicInfo,
  AffiliateHierarchyResponse,
  DownlineAffiliateInfo,
  HierarchyLevelInfo,
} from '../common/interface/affiliate-hierarchy.interface';
import { AffiliateTreeNode } from '../common/interface/affiliate-tree.interface';

@Injectable()
export class AffiliatesService {
  constructor(
    @InjectRepository(Affiliate)
    private affiliateRepo: Repository<Affiliate>,
  ) {}

  async getHierarchy(affiliateId: string): Promise<AffiliateHierarchyResponse> {
    // Load current affiliate with all necessary relations
    const currentAffiliate = await this.affiliateRepo.findOne({
      where: { id: affiliateId },
      relations: [
        'user',
        'parent',
        'parent.user',
        'parent.parent',
        'parent.parent.user',
        'parent.parent.parent',
        'parent.parent.parent.user',
        'children',
        'children.user',
      ],
    });

    if (!currentAffiliate) {
      throw new NotFoundException(`Affiliate with ID ${affiliateId} not found`);
    }

    // Build response object
    const response: AffiliateHierarchyResponse = {
      current: this.mapToBasicInfo(currentAffiliate),
      directDownline: [],
      totalDownlineCount: 0,
    };

    // Upline levels (Level 1, 2, 3)
    if (currentAffiliate.parent) {
      response.level1 = this.mapToHierarchyLevelInfo(
        currentAffiliate.parent,
        10,
      );

      if (currentAffiliate.parent.parent) {
        response.level2 = this.mapToHierarchyLevelInfo(
          currentAffiliate.parent.parent,
          5,
        );

        if (currentAffiliate.parent.parent.parent) {
          const level3Affiliate = await this.affiliateRepo.findOne({
            where: { id: currentAffiliate.parent.parent.parent.id },
            relations: ['user'],
          });

          if (level3Affiliate) {
            response.level3 = this.mapToHierarchyLevelInfo(
              level3Affiliate,
              2.5,
            );
          }
        }
      }
    }

    // Downline (affiliates you referred directly)
    if (currentAffiliate.children && currentAffiliate.children.length > 0) {
      response.directDownline = currentAffiliate.children.map((child) =>
        this.mapToDownlineInfo(child),
      );
    }

    // Calculate total downline count (direct + indirect)
    response.totalDownlineCount =
      await this.calculateTotalDownlineCount(affiliateId);

    return response;
  }

  private mapToBasicInfo(affiliate: Affiliate): AffiliateBasicInfo {
    return {
      id: affiliate.id,
      name: affiliate.user?.name || 'Unknown',
      email: affiliate.user?.email || '',
      level: affiliate.level,
      joinDate: affiliate.createdAt,
      totalEarned: Number(affiliate.totalEarned) || 0,
      status: affiliate.status,
      commissionRate: Number(affiliate.commissionRate) || 0,
    };
  }

  private mapToHierarchyLevelInfo(
    affiliate: Affiliate,
    commissionPercentage: number,
  ): HierarchyLevelInfo {
    return {
      id: affiliate.id,
      name: affiliate.user?.name || 'Unknown',
      email: affiliate.user?.email || '',
      commissionPercentage,
      joinDate: affiliate.createdAt,
      totalEarned: Number(affiliate.totalEarned) || 0,
    };
  }

  private mapToDownlineInfo(affiliate: Affiliate): DownlineAffiliateInfo {
    return {
      id: affiliate.id,
      name: affiliate.user?.name || 'Unknown',
      email: affiliate.user?.email || '',
      level: affiliate.level,
      joinDate: affiliate.createdAt,
      totalEarned: Number(affiliate.totalEarned) || 0,
    };
  }

  private async calculateTotalDownlineCount(
    affiliateId: string,
  ): Promise<number> {
    // This is a recursive function to count all downline affiliates
    const countDownline = async (id: string): Promise<number> => {
      const affiliate = await this.affiliateRepo.findOne({
        where: { id },
        relations: ['children'],
      });

      if (!affiliate || !affiliate.children) {
        return 0;
      }

      let count = affiliate.children.length;

      // Recursively count children's children
      for (const child of affiliate.children) {
        count += await countDownline(child.id);
      }

      return count;
    };

    return await countDownline(affiliateId);
  }

  // Optional: Get complete tree structure
  // async getCompleteTree(affiliateId: string): Promise<any> {
  //   const buildTree = async (
  //     id: string,
  //     depth: number = 0,
  //     maxDepth: number = 5,
  //   ): Promise<any> => {
  //     if (depth >= maxDepth) return null;

  //     const affiliate = await this.affiliateRepo.findOne({
  //       where: { id },
  //       relations: ['user', 'children', 'children.user'],
  //     });

  //     if (!affiliate) return null;

  //     const node = {
  //       id: affiliate.id,
  //       name: affiliate.user?.name || 'Unknown',
  //       level: affiliate.level,
  //       totalEarned: Number(affiliate.totalEarned) || 0,
  //       children: [] as any[],
  //     };

  //     if (affiliate.children && affiliate.children.length > 0) {
  //       for (const child of affiliate.children) {
  //         const childTree = await buildTree(child.id, depth + 1, maxDepth);
  //         if (childTree) {
  //           node.children.push(childTree);
  //         }
  //       }
  //     }

  //     return node;
  //   };

  //   return await buildTree(affiliateId);
  // }

  //probando
  async getCompleteTree(affiliateId: string): Promise<AffiliateTreeNode> {
    return await this.buildTree(affiliateId);
  }

  private async buildTree(
    affiliateId: string,
    depth: number = 0,
    maxDepth: number = 5,
  ): Promise<AffiliateTreeNode> {
    if (depth >= maxDepth) {
      return {
        id: affiliateId,
        name: 'Depth Limit Reached',
        level: 0,
        totalEarned: 0,
        children: [],
      };
    }

    const affiliate = await this.affiliateRepo.findOne({
      where: { id: affiliateId },
      relations: ['user', 'children', 'children.user'],
    });

    if (!affiliate) {
      throw new NotFoundException(`Affiliate with ID ${affiliateId} not found`);
    }

    const node: AffiliateTreeNode = {
      id: affiliate.id,
      name: affiliate.user?.name || 'Unknown',
      level: affiliate.level,
      totalEarned: Number(affiliate.totalEarned) || 0,
      children: [],
    };

    if (affiliate.children && affiliate.children.length > 0) {
      for (const child of affiliate.children) {
        try {
          const childTree = await this.buildTree(child.id, depth + 1, maxDepth);
          node.children.push(childTree);
        } catch (error) {
          // Skip if child not found
          console.warn(
            `Child affiliate ${child.id} not found, skipping`,
            error,
          );
        }
      }
    }

    return node;
  }
}
