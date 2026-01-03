import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission, CommissionStatus } from './entities/commission.entity';
import { Sale } from '../sales/entities/sale.entity';
import {
  Affiliate,
  AffiliateLevel,
  AffiliateStatus,
} from '../affiliates/entities/affiliate.entity';
import {
  CommissionHierarchyResponse,
  CommissionsByLevelResponse,
  CommissionStatsResponse,
} from '../common/interface/commissions.interface';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

// Definir clases DTO para Swagger
class CommissionStatsResponseDto implements CommissionStatsResponse {
  total: number;
  totalEarned: number;
  pending: number;
  paid: number;
  byLevel: {
    level1: number;
    level2: number;
    level3: number;
  };
}

class CommissionsByLevelResponseDto implements CommissionsByLevelResponse {
  totalCommissions: number;
  totalAmount: number;
  byLevel: {
    level1: {
      count: number;
      totalAmount: number;
      percentage: number;
      description: string;
    };
    level2: {
      count: number;
      totalAmount: number;
      percentage: number;
      description: string;
    };
    level3: {
      count: number;
      totalAmount: number;
      percentage: number;
      description: string;
    };
  };
}

class CommissionHierarchyResponseDto implements CommissionHierarchyResponse {
  current: {
    id: string;
    name: string;
    totalEarned: number;
    level: number;
  };
  level1?: {
    id: string;
    name: string;
    email?: string;
    commissionPercentage: number;
    totalEarnedFromYou: number;
    totalCommissionsFromYou: number;
  };
  level2?: {
    id: string;
    name: string;
    email?: string;
    commissionPercentage: number;
    totalEarnedFromYou: number;
    totalCommissionsFromYou: number;
  };
  level3?: {
    id: string;
    name: string;
    email?: string;
    commissionPercentage: number;
    totalEarnedFromYou: number;
    totalCommissionsFromYou: number;
  };
}

@ApiTags('commissions')
@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(Commission)
    private commissionRepo: Repository<Commission>,
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
    @InjectRepository(Affiliate)
    private affiliateRepo: Repository<Affiliate>,
  ) {}

  @ApiOperation({ summary: 'Calculate commissions for a sale' })
  @ApiParam({ name: 'saleId', type: String, description: 'Sale ID' })
  @ApiResponse({
    status: 200,
    description: 'Commissions calculated successfully',
    type: [Commission],
  })
  @ApiResponse({
    status: 404,
    description: 'Sale not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid sale data',
  })
  async calculateCommissionsForSale(saleId: string): Promise<Commission[]> {
    console.log(`🔍 Calculando comisiones para venta: ${saleId}`);

    // 1. Buscar venta con su afiliado
    const sale = await this.saleRepo.findOne({
      where: { id: saleId },
      relations: ['affiliate'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${saleId} not found`);
    }

    // Validar monto de venta
    if (sale.amount <= 0) {
      throw new BadRequestException('Sale amount must be greater than 0');
    }

    // Si no hay afiliado asociado a la venta, no hay comisiones
    if (!sale.affiliate) {
      console.log(`⚠️ Venta ${saleId} no tiene afiliado asociado`);
      return [];
    }

    console.log(`📊 Venta: $${sale.amount}, Vendedor: ${sale.affiliate.id}`);

    const commissions: Commission[] = [];
    const commissionRates = [0.1, 0.05, 0.025]; // [10%, 5%, 2.5%]

    // Comenzar con el afiliado actual (vendedor)
    let currentAffiliate = sale.affiliate;

    // Recorrer 3 niveles hacia arriba
    for (let level = 0; level < 3; level++) {
      // Si no tiene parent, terminamos
      if (!currentAffiliate.parentId) {
        console.log(`⏹️ Fin de la jerarquía en nivel ${level}`);
        break;
      }

      console.log(
        `🔍 Buscando Nivel ${level + 1}: ${currentAffiliate.parentId}`,
      );

      // Buscar el afiliado padre - ¡SOLO ACTIVOS!
      const parentAffiliate = await this.affiliateRepo.findOne({
        where: {
          id: currentAffiliate.parentId,
          status: AffiliateStatus.ACTIVE, // ← CRÍTICO: Solo activos
        },
      });

      // Si no encontramos un afiliado ACTIVO, terminamos la cadena
      if (!parentAffiliate) {
        console.log(`⚠️ Nivel ${level + 1} no encontrado o no activo`);
        break;
      }

      console.log(`✅ Nivel ${level + 1} encontrado: ${parentAffiliate.id}`);

      // Crear comisión
      const commission = await this.createCommission(
        sale,
        parentAffiliate,
        level + 1, // Nivel de comisión: 1, 2, 3
        commissionRates[level], // Porcentaje correspondiente
      );

      commissions.push(commission);

      // Movemos hacia arriba en la jerarquía
      currentAffiliate = parentAffiliate;
    }

    console.log(`🎯 Comisiones generadas: ${commissions.length}`);
    return commissions;
  }

  private async createCommission(
    sale: Sale,
    affiliate: Affiliate,
    level: number,
    percentage: number,
  ): Promise<Commission> {
    const amount = Number(sale.amount) * percentage;

    const commission = this.commissionRepo.create({
      saleId: sale.id,
      affiliateId: affiliate.id,
      level,
      amount,
      percentage: percentage * 100, // Guardar como porcentaje (10, 5, 2.5)
      status: CommissionStatus.PENDING,
    });

    const savedCommission = await this.commissionRepo.save(commission);

    // Actualizar total ganado del afiliado
    await this.affiliateRepo.increment(
      { id: affiliate.id },
      'totalEarned',
      amount,
    );

    return savedCommission;
  }

  @ApiOperation({ summary: 'Get commissions by affiliate' })
  @ApiParam({ name: 'affiliateId', type: String, description: 'Affiliate ID' })
  @ApiResponse({
    status: 200,
    description: 'List of commissions',
    type: [Commission],
  })
  async getCommissionsByAffiliate(affiliateId: string): Promise<Commission[]> {
    return this.commissionRepo.find({
      where: { affiliateId },
      relations: ['sale', 'sale.affiliate', 'sale.affiliate.user'],
      order: { createdAt: 'DESC' },
    });
  }

  @ApiOperation({ summary: 'Get commission statistics for an affiliate' })
  @ApiParam({ name: 'affiliateId', type: String, description: 'Affiliate ID' })
  @ApiResponse({
    status: 200,
    description: 'Commission statistics',
    type: CommissionStatsResponseDto,
  })
  async getCommissionStats(
    affiliateId: string,
  ): Promise<CommissionStatsResponse> {
    const commissions = await this.getCommissionsByAffiliate(affiliateId);

    const stats: CommissionStatsResponse = {
      total: commissions.length,
      totalEarned: commissions.reduce((sum, c) => sum + Number(c.amount), 0),
      pending: commissions.filter((c) => c.status === CommissionStatus.PENDING)
        .length,
      paid: commissions.filter((c) => c.status === CommissionStatus.PAID)
        .length,
      byLevel: {
        level1: commissions
          .filter((c) => c.level === 1)
          .reduce((sum, c) => sum + Number(c.amount), 0),
        level2: commissions
          .filter((c) => c.level === 2)
          .reduce((sum, c) => sum + Number(c.amount), 0),
        level3: commissions
          .filter((c) => c.level === 3)
          .reduce((sum, c) => sum + Number(c.amount), 0),
      },
    };

    return stats;
  }

  @ApiOperation({ summary: 'Mark a commission as paid' })
  @ApiParam({
    name: 'commissionId',
    type: String,
    description: 'Commission ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Commission marked as paid',
    type: Commission,
  })
  @ApiResponse({
    status: 404,
    description: 'Commission not found',
  })
  async markAsPaid(commissionId: string): Promise<Commission> {
    const commission = await this.commissionRepo.findOne({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new NotFoundException(
        `Commission with ID ${commissionId} not found`,
      );
    }

    commission.status = CommissionStatus.PAID;
    commission.paidAt = new Date();

    return this.commissionRepo.save(commission);
  }

  @ApiOperation({ summary: 'Get commissions grouped by level' })
  @ApiParam({ name: 'affiliateId', type: String, description: 'Affiliate ID' })
  @ApiResponse({
    status: 200,
    description: 'Commissions grouped by level',
    type: CommissionsByLevelResponseDto,
  })
  async getCommissionsByLevel(
    affiliateId: string,
  ): Promise<CommissionsByLevelResponse> {
    const commissions = await this.commissionRepo.find({
      where: { affiliateId },
      relations: ['sale'],
    });

    // Agrupar por nivel
    const level1 = commissions.filter((c) => c.level === 1);
    const level2 = commissions.filter((c) => c.level === 2);
    const level3 = commissions.filter((c) => c.level === 3);

    // Calcular totales
    const level1Total = level1.reduce((sum, c) => sum + Number(c.amount), 0);
    const level2Total = level2.reduce((sum, c) => sum + Number(c.amount), 0);
    const level3Total = level3.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalAmount = level1Total + level2Total + level3Total;

    const response: CommissionsByLevelResponse = {
      totalCommissions: commissions.length,
      totalAmount,
      byLevel: {
        level1: {
          count: level1.length,
          totalAmount: level1Total,
          percentage: 10,
          description: 'Direct referrer commissions (10%)',
        },
        level2: {
          count: level2.length,
          totalAmount: level2Total,
          percentage: 5,
          description: 'Second level commissions (5%)',
        },
        level3: {
          count: level3.length,
          totalAmount: level3Total,
          percentage: 2.5,
          description: 'Third level commissions (2.5%)',
        },
      },
    };

    return response;
  }

  @ApiOperation({ summary: 'Get commission hierarchy for an affiliate' })
  @ApiParam({ name: 'affiliateId', type: String, description: 'Affiliate ID' })
  @ApiResponse({
    status: 200,
    description: 'Commission hierarchy',
    type: CommissionHierarchyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Affiliate not found',
  })
  async getCommissionHierarchy(
    affiliateId: string,
  ): Promise<CommissionHierarchyResponse> {
    // Obtener el afiliado actual con sus relaciones
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
      ],
    });

    if (!currentAffiliate) {
      throw new NotFoundException(`Affiliate with ID ${affiliateId} not found`);
    }

    const result: CommissionHierarchyResponse = {
      current: {
        id: currentAffiliate.id,
        name: currentAffiliate.user.name,
        totalEarned: Number(currentAffiliate.totalEarned) || 0,
        level: currentAffiliate.level,
      },
    };

    // Configuración de porcentajes por nivel
    const commissionPercentages = {
      1: 10,
      2: 5,
      3: 2.5,
    };

    // Función para calcular comisiones ganadas desde este afiliado
    const calculateCommissionsFromAffiliate = async (
      targetAffiliateId: string,
      sourceAffiliateId: string,
    ) => {
      const commissions = await this.commissionRepo.find({
        where: {
          affiliateId: targetAffiliateId,
          sale: {
            affiliateId: sourceAffiliateId,
          },
        },
        relations: ['sale'],
      });

      return {
        totalAmount: commissions.reduce((sum, c) => sum + Number(c.amount), 0),
        count: commissions.length,
      };
    };

    // Nivel 1: Parent directo
    if (currentAffiliate.parent) {
      const commissionsFromYou = await calculateCommissionsFromAffiliate(
        currentAffiliate.parent.id,
        currentAffiliate.id,
      );

      result.level1 = {
        id: currentAffiliate.parent.id,
        name: currentAffiliate.parent.user?.name || 'Unknown',
        email: currentAffiliate.parent.user?.email,
        commissionPercentage: commissionPercentages[1],
        totalEarnedFromYou: commissionsFromYou.totalAmount,
        totalCommissionsFromYou: commissionsFromYou.count,
      };

      // Nivel 2: Grandparent
      if (currentAffiliate.parent.parent) {
        const commissionsFromYou = await calculateCommissionsFromAffiliate(
          currentAffiliate.parent.parent.id,
          currentAffiliate.id,
        );

        result.level2 = {
          id: currentAffiliate.parent.parent.id,
          name: currentAffiliate.parent.parent.user?.name || 'Unknown',
          email: currentAffiliate.parent.parent.user?.email,
          commissionPercentage: commissionPercentages[2],
          totalEarnedFromYou: commissionsFromYou.totalAmount,
          totalCommissionsFromYou: commissionsFromYou.count,
        };

        // Nivel 3: Great-grandparent
        if (currentAffiliate.parent.parent.parent) {
          const level3Affiliate = await this.affiliateRepo.findOne({
            where: { id: currentAffiliate.parent.parent.parent.id },
            relations: ['user'],
          });

          if (level3Affiliate) {
            const commissionsFromYou = await calculateCommissionsFromAffiliate(
              level3Affiliate.id,
              currentAffiliate.id,
            );

            result.level3 = {
              id: level3Affiliate.id,
              name: level3Affiliate.user?.name || 'Unknown',
              email: level3Affiliate.user?.email,
              commissionPercentage: commissionPercentages[3],
              totalEarnedFromYou: commissionsFromYou.totalAmount,
              totalCommissionsFromYou: commissionsFromYou.count,
            };
          }
        }
      }
    }

    return result;
  }

  @ApiOperation({ summary: 'Get all commissions' })
  @ApiResponse({
    status: 200,
    description: 'List of all commissions',
    type: [Commission],
  })
  async getAllCommissions(): Promise<Commission[]> {
    return this.commissionRepo.find({
      relations: ['sale', 'affiliate', 'affiliate.user', 'sale.affiliate'],
      order: { createdAt: 'DESC' },
    });
  }

  // Métodos adicionales recomendados

  @ApiOperation({ summary: 'Get commissions with pagination' })
  @ApiParam({
    name: 'page',
    type: Number,
    description: 'Page number',
    required: false,
  })
  @ApiParam({
    name: 'limit',
    type: Number,
    description: 'Items per page',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of commissions',
    type: [Commission],
  })
  async getPaginatedCommissions(
    page: number = 1,
    limit: number = 10,
  ): Promise<Commission[]> {
    const skip = (page - 1) * limit;

    return this.commissionRepo.find({
      relations: ['sale', 'affiliate', 'affiliate.user', 'sale.affiliate'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  @ApiOperation({ summary: 'Get total commission amount by affiliate' })
  @ApiParam({ name: 'affiliateId', type: String, description: 'Affiliate ID' })
  @ApiResponse({
    status: 200,
    description: 'Total commission amount',
    schema: {
      type: 'object',
      properties: {
        totalAmount: { type: 'number' },
        totalCommissions: { type: 'number' },
      },
    },
  })
  async getTotalCommissionAmount(
    affiliateId: string,
  ): Promise<{ totalAmount: number; totalCommissions: number }> {
    const commissions = await this.getCommissionsByAffiliate(affiliateId);

    return {
      totalAmount: commissions.reduce((sum, c) => sum + Number(c.amount), 0),
      totalCommissions: commissions.length,
    };
  }

  // En CommissionsService
  async getAllCommissionsGroupedByLevel(): Promise<any> {
    const allCommissions = await this.getAllCommissions();

    // Agrupar por nivel
    const byLevel = {
      level1: allCommissions.filter((c) => c.level === 1),
      level2: allCommissions.filter((c) => c.level === 2),
      level3: allCommissions.filter((c) => c.level === 3),
    };

    return {
      totalCommissions: allCommissions.length,
      totalAmount: allCommissions.reduce((sum, c) => sum + Number(c.amount), 0),
      byLevel: {
        level1: {
          count: byLevel.level1.length,
          totalAmount: byLevel.level1.reduce(
            (sum, c) => sum + Number(c.amount),
            0,
          ),
          percentage: 10,
        },
        level2: {
          count: byLevel.level2.length,
          totalAmount: byLevel.level2.reduce(
            (sum, c) => sum + Number(c.amount),
            0,
          ),
          percentage: 5,
        },
        level3: {
          count: byLevel.level3.length,
          totalAmount: byLevel.level3.reduce(
            (sum, c) => sum + Number(c.amount),
            0,
          ),
          percentage: 2.5,
        },
      },
    };
  }

  async getHierarchyOverview(): Promise<any> {
    const allAffiliates = await this.affiliateRepo.find({
      relations: ['user', 'parent'],
    });

    // Encontrar afiliados por nivel
    const level1Affiliates = allAffiliates.filter(
      (a) => a.level === AffiliateLevel.LEVEL_1,
    );
    const level2Affiliates = allAffiliates.filter(
      (a) => a.level === AffiliateLevel.LEVEL_2,
    );
    const level3Affiliates = allAffiliates.filter(
      (a) => a.level === AffiliateLevel.LEVEL_3,
    );
    const sellerAffiliates = allAffiliates.filter(
      (a) => a.level === AffiliateLevel.SELLER,
    );

    return {
      summary: {
        totalAffiliates: allAffiliates.length,
        level1Count: level1Affiliates.length,
        level2Count: level2Affiliates.length,
        level3Count: level3Affiliates.length,
        sellerCount: sellerAffiliates.length,
      },
      totalCommissions: (await this.getAllCommissions()).length,
      totalCommissionAmount: (await this.getAllCommissions()).reduce(
        (sum, c) => sum + Number(c.amount),
        0,
      ),
    };
  }
}
