// import { AffiliatesModule } from './affiliates/affiliates.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
// import { CommissionsModule } from './commissions/commissions.module';
// import { Module } from '@nestjs/common';
// import { SalesModule } from './sales/sales.module';
// import { UsersModule } from './users/users.module';

// @Module({
//   imports: [UsersModule, AuthModule, AffiliatesModule, SalesModule, CommissionsModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

// import { ConfigModule, ConfigService } from '@nestjs/config';

// import { AffiliatesModule } from './affiliates/affiliates.module';
// import { AuthModule } from './auth/auth.module';
// import { CommissionsModule } from './commissions/commissions.module';
// import { Module } from '@nestjs/common';
// import { SalesModule } from './sales/sales.module';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UsersModule } from './users/users.module';
// import { getDatabaseConfig } from './config/dtabase.config';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: '.env',
//     }),
//     TypeOrmModule.forRootAsync({
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) =>
//         getDatabaseConfig(configService),
//     }),
//     AuthModule,
//     UsersModule,
//     AffiliatesModule,
//     SalesModule,
//     CommissionsModule,
//   ],
// })
// export class AppModule {}

import { ConfigModule, ConfigService } from '@nestjs/config';

import { AffiliatesModule } from './affiliates/affiliates.module';
import { AuthModule } from './auth/auth.module';
import { CommissionsModule } from './commissions/commissions.module';
import { Module } from '@nestjs/common';
import { SalesModule } from './sales/sales.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { getDatabaseConfig } from './config/dtabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    AuthModule,
    UsersModule,
    AffiliatesModule,
    SalesModule,
    CommissionsModule,
  ],
})
export class AppModule {}
