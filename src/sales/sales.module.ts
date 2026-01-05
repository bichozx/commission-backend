import { Affiliate } from '../affiliates/entities/affiliate.entity';
import { Module } from '@nestjs/common';
import { Sale } from './entities/sale.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliate, Sale])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
