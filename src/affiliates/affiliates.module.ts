// import { Affiliate } from './entities/affiliate.entity';
// import { AffiliatesController } from './affiliates.controller';
// import { AffiliatesService } from './affiliates.service';
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

// @Module({
//   imports: [TypeOrmModule.forFeature([Affiliate])],
//   controllers: [AffiliatesController],
//   providers: [AffiliatesService],
//   exports: [AffiliatesService], // 👈🔥 CLAVE
// })
// export class AffiliatesModule {}

import { Affiliate } from './entities/affiliate.entity';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliate])],
  providers: [AffiliatesService],
  controllers: [AffiliatesController],
  exports: [AffiliatesService], // 🔥 OBLIGATORIO
})
export class AffiliatesModule {}
