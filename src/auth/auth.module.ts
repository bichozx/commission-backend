// import { Affiliate } from '../affiliates/entities/affiliate.entity';
// import { AffiliatesModule } from '../affiliates/affiliates.module'; // 👈🔥
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { JwtModule } from '@nestjs/jwt';
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from '../users/entities/user.entity';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([User, Affiliate]),
//     JwtModule.register({
//       secret: process.env.JWT_SECRET || 'supersecret',
//       signOptions: { expiresIn: '1d' },
//     }),
//     AffiliatesModule, // 👈🔥 IMPORTANTE
//   ],
//   controllers: [AuthController],
//   providers: [AuthService],
// })
// export class AuthModule {}

import { ConfigModule, ConfigService } from '@nestjs/config';

import { Affiliate } from '../affiliates/entities/affiliate.entity';
import { AffiliatesModule } from '../affiliates/affiliates.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    ConfigModule,

    TypeOrmModule.forFeature([User, Affiliate]),

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'super-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),

    AffiliatesModule, // 🔥 IMPORTANTE
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
