import { CommissionsModule } from '../commissions/commissions.module';
import { Module } from '@nestjs/common';
import { Sale } from './entities/sale.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Sale]), CommissionsModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService, TypeOrmModule],
})
export class SalesModule {}
