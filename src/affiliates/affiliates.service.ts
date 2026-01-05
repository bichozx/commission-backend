import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Affiliate,
  AffiliateLevel,
  AffiliateStatus,
} from './entities/affiliate.entity';
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

    const response: AffiliateHierarchyResponse = {
      current: this.mapToBasicInfo(currentAffiliate),
      directDownline: [],
      totalDownlineCount: 0,
    };

    // Upline
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

    // Downline
    if (currentAffiliate.children?.length > 0) {
      response.directDownline = currentAffiliate.children.map((child) =>
        this.mapToDownlineInfo(child),
      );
    }

    response.totalDownlineCount =
      await this.calculateTotalDownlineCount(affiliateId);

    return response;
  }

  private mapToBasicInfo(affiliate: Affiliate): AffiliateBasicInfo {
    return {
      id: affiliate.id,
      name: affiliate.user?.name || 'Unknown',
      email: affiliate.user?.email || 'Unknown',
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
      email: affiliate.user?.email || 'Unknown',
      commissionPercentage,
      joinDate: affiliate.createdAt,
      totalEarned: Number(affiliate.totalEarned) || 0,
    };
  }

  private mapToDownlineInfo(affiliate: Affiliate): DownlineAffiliateInfo {
    return {
      id: affiliate.id,
      name: affiliate.user?.name || 'Unknown',
      email: affiliate.user?.email || 'Unknown',
      level: affiliate.level,
      joinDate: affiliate.createdAt,
      totalEarned: Number(affiliate.totalEarned) || 0,
    };
  }

  private async calculateTotalDownlineCount(
    affiliateId: string,
  ): Promise<number> {
    const countDownline = async (id: string): Promise<number> => {
      const affiliate = await this.affiliateRepo.findOne({
        where: { id },
        relations: ['children'],
      });

      if (!affiliate || !affiliate.children) return 0;

      let count = affiliate.children.length;

      for (const child of affiliate.children) {
        count += await countDownline(child.id);
      }

      return count;
    };

    return await countDownline(affiliateId);
  }

  /** ----------------------------------------------
   * TREE (optimized for frontend)
   * ---------------------------------------------- */
  async getCompleteTree(affiliateId: string): Promise<AffiliateTreeNode> {
    const affiliate = await this.affiliateRepo.findOne({
      where: { id: affiliateId },
      relations: [
        'user',
        'children',
        'children.user',
        'children.children',
        'children.children.user',
        'children.children.children',
        'children.children.children.user',
      ],
    });

    if (!affiliate) throw new NotFoundException('Affiliate not found');

    return this.buildTreeOptimized(affiliate);
  }

  private buildTreeOptimized(
    affiliate: Affiliate,
    maxDepth: number = 5,
    depth: number = 0,
  ): AffiliateTreeNode {
    // Si no hay affiliate o se alcanza la profundidad máxima, devuelve un nodo vacío
    if (!affiliate || depth >= maxDepth) {
      return {
        id: 'unknown',
        name: 'Depth limit reached',
        email: '',
        level: 0,
        totalEarned: 0,
        status: '',
        parentId: undefined,
        children: [],
      };
    }

    const node: AffiliateTreeNode = {
      id: affiliate.id,
      name: affiliate.user?.name || 'Unknown',
      email: affiliate.user?.email || '',
      level: affiliate.level,
      totalEarned: Number(affiliate.totalEarned) || 0,
      status: affiliate.status || '',
      parentId: affiliate.parentId || undefined,
      children:
        affiliate.children?.map((child) =>
          this.buildTreeOptimized(child, maxDepth, depth + 1),
        ) || [],
    };

    return node;
  }

  async createAffiliate(userId: string, parentId?: string): Promise<Affiliate> {
    let level = AffiliateLevel.LEVEL_1;

    let parent: Affiliate | null = null;
    if (parentId) {
      parent = await this.affiliateRepo.findOne({ where: { id: parentId } });
      if (!parent) throw new Error('Parent not found');

      switch (parent.level) {
        case AffiliateLevel.LEVEL_1:
          level = AffiliateLevel.LEVEL_2;
          break;
        case AffiliateLevel.LEVEL_2:
          level = AffiliateLevel.LEVEL_3;
          break;
        default:
          level = AffiliateLevel.LEVEL_3;
      }
    }

    const commissionRate = this.getCommissionRate(level);

    const affiliate = this.affiliateRepo.create({
      userId,
      parent,
      parentId: parent?.id ?? null,
      level,
      commissionRate,
    });

    return this.affiliateRepo.save(affiliate);
  }

  async updateAffiliate(
    affiliateId: string,
    data: Partial<{
      level: AffiliateLevel;
      commissionRate: number;
      status: string;
    }>,
  ): Promise<Affiliate> {
    const affiliate = await this.affiliateRepo.findOne({
      where: { id: affiliateId },
    });
    if (!affiliate) throw new NotFoundException('Affiliate not found');

    if (data.level !== undefined) affiliate.level = data.level;
    if (data.commissionRate !== undefined)
      affiliate.commissionRate = data.commissionRate;
    if (data.status !== undefined)
      affiliate.status = data.status as AffiliateStatus;

    return this.affiliateRepo.save(affiliate);
  }

  /** ----------------------------------------------
   * LIST AFFILIATES BY LEVEL
   * ---------------------------------------------- */
  async getAffiliatesByLevel(level?: AffiliateLevel): Promise<Affiliate[]> {
    const query = this.affiliateRepo
      .createQueryBuilder('affiliate')
      .leftJoinAndSelect('affiliate.user', 'user');

    if (level !== undefined) {
      query.where('affiliate.level = :level', { level });
    }

    return query.getMany();
  }

  /** ----------------------------------------------
   * HELPERS
   * ---------------------------------------------- */
  private getCommissionRate(level: AffiliateLevel): number {
    switch (level) {
      case AffiliateLevel.LEVEL_1:
        return 10;
      case AffiliateLevel.LEVEL_2:
        return 5;
      case AffiliateLevel.LEVEL_3:
        return 2.5;
      default:
        return 0;
    }
  }
}
