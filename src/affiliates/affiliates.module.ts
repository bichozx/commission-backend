// import { Module } from '@nestjs/common';
// import { AffiliatesService } from './affiliates.service';
// import { AffiliatesController } from './affiliates.controller';

// @Module({
//   providers: [AffiliatesService],
//   controllers: [AffiliatesController]
// })
// export class AffiliatesModule {}

// import { AffiliatesController } from './affiliates.controller';
// import { AffiliatesService } from './affiliates.service';
// import { Module } from '@nestjs/common';

// @Module({
//   providers: [AffiliatesService],
//   controllers: [AffiliatesController],
// })
// export class AffiliatesModule {}

import { Affiliate } from './entities/affiliate.entity';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
//probando
// src/affiliates/affiliates.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliate])],
  controllers: [AffiliatesController],
  providers: [AffiliatesService],
  exports: [AffiliatesService],
})
export class AffiliatesModule {}
