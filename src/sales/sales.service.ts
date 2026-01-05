import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Affiliate } from '../affiliates/entities/affiliate.entity';

import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from './entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Affiliate)
    private affiliateRepo: Repository<Affiliate>,

    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
  ) {}

  async registerSale(dto: CreateSaleDto) {
    const { affiliateId, amount, description } = dto;

    // 1️⃣ Buscar afiliado
    const affiliate = await this.affiliateRepo.findOne({
      where: { id: affiliateId },
      relations: ['parent', 'parent.parent', 'parent.parent.parent'], // hasta 3 niveles
    });
    if (!affiliate) throw new NotFoundException('Affiliate not found');

    // 2️⃣ Guardar venta usando Sale
    const sale = this.saleRepo.create({
      affiliateId,
      affiliate,
      amount,
      description: description ?? undefined,
      saleDate: new Date(),
    });
    await this.saleRepo.save(sale);

    // 3️⃣ Distribuir comisiones a los padres
    await this.distributeCommission(affiliate, amount);

    return {
      message: 'Sale registered and commissions distributed successfully',
      sale,
    };
  }

  private async distributeCommission(
    affiliate: Affiliate,
    amount: number,
    maxLevels = 3,
    currentLevel = 1,
  ) {
    if (!affiliate.parent || currentLevel > maxLevels) return;

    const parent = affiliate.parent;
    const commission = (amount * Number(parent.commissionRate)) / 100;

    parent.totalEarned = Number(parent.totalEarned) + commission;
    await this.affiliateRepo.save(parent);

    if (parent.parent) {
      await this.distributeCommission(
        parent,
        amount,
        maxLevels,
        currentLevel + 1,
      );
    }
  }
}
