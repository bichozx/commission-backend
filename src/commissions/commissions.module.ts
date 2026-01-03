import { Affiliate } from '../affiliates/entities/affiliate.entity';
import { Commission } from './entities/commission.entity';
import { CommissionsController } from './commissions.controller';
import { CommissionsService } from './commissions.service';
import { Module } from '@nestjs/common';
import { Sale } from '../sales/entities/sale.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Commission, Sale, Affiliate])],
  controllers: [CommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService, TypeOrmModule],
})
export class CommissionsModule {}
