import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CommissionsService } from '../commissions/commissions.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
    private commissionsService: CommissionsService,
  ) {}

  // async create(
  //   createSaleDto: CreateSaleDto,
  //   affiliateId: string,
  // ): Promise<{
  //   sale: Sale;
  //   commissions: any[]; // O crea una interfaz CommissionResponse
  //   message: string;
  // }> {
  //   // Crear la venta
  //   const sale = this.saleRepo.create({
  //     ...createSaleDto,
  //     affiliateId,
  //   });

  //   const savedSale = await this.saleRepo.save(sale);

  //   // Calcular comisiones automáticamente
  //   const commissions =
  //     await this.commissionsService.calculateCommissionsForSale(savedSale.id);

  //   return {
  //     sale: savedSale,
  //     commissions,
  //     message: `Sale created successfully. ${commissions.length} commission(s) calculated with percentages: ${commissions
  //       .map((c) => `Level ${c.level} (${c.percentage}%)`)
  //       .join(', ')}`,
  //   };
  // }

  async create(
    createSaleDto: CreateSaleDto,
    requestingAffiliateId: string, // Renombrar para claridad
  ): Promise<{
    sale: Sale;
    commissions: any[];
    message: string;
  }> {
    // IMPORTANTE: ¿Quién hace la venta?
    // Opción A: El afiliado autenticado (requestingAffiliateId)
    // Opción B: Un afiliado específico (si el admin puede crear ventas para otros)

    // Para MVP, asumimos que el afiliado autenticado hace la venta
    const sale = this.saleRepo.create({
      amount: createSaleDto.amount,
      description: createSaleDto.description,
      affiliateId: requestingAffiliateId, // Usar el afiliado autenticado
    });

    const savedSale = await this.saleRepo.save(sale);

    // Calcular comisiones
    const commissions =
      await this.commissionsService.calculateCommissionsForSale(savedSale.id);

    return {
      sale: savedSale,
      commissions,
      message: `✅ Sale created successfully. ${commissions.length} commission(s) calculated with percentages: ${commissions
        .map((c) => `Level ${c.level} (${c.percentage}%)`)
        .join(', ')}`,
    };
  }

  async findAllByAffiliate(affiliateId: string): Promise<Sale[]> {
    return this.saleRepo.find({
      where: { affiliateId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneWithCommissions(id: string) {
    const sale = await this.saleRepo.findOne({
      where: { id },
      relations: ['affiliate', 'affiliate.user'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async getStats(affiliateId: string) {
    const sales = await this.findAllByAffiliate(affiliateId);

    return {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + Number(sale.amount), 0),
      avgSaleAmount:
        sales.length > 0
          ? sales.reduce((sum, sale) => sum + Number(sale.amount), 0) /
            sales.length
          : 0,
    };
  }
}
