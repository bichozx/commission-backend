/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { ConfigService } from '@nestjs/config';
// import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// export const getDatabaseConfig = (
//   configService: ConfigService,
// ): TypeOrmModuleOptions => ({
//   type: 'postgres',
//   host: configService.get('DB_HOST', 'localhost'),
//   port: configService.get('DB_PORT', 5432),
//   username: configService.get('DB_USERNAME', 'postgres'),
//   password: configService.get('DB_PASSWORD', 'Danger4587'),
//   database: configService.get('DB_NAME', 'commissions_db'),
//   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//   synchronize: configService.get('NODE_ENV') === 'development',
//   logging: configService.get('NODE_ENV') === 'development',
//   ssl:
//     configService.get('NODE_ENV') === 'production'
//       ? { rejectUnauthorized: false }
//       : false,
// });

// src/config/database.config.ts
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const databaseUrl = configService.get('DATABASE_URL');

  // ✅ POSTGRESQL EN SUPABASE (PRODUCCIÓN)
  if (isProduction && databaseUrl) {
    console.log('🚀 Using PostgreSQL on Supabase (Production)');

    return {
      type: 'postgres',
      url: databaseUrl,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false, // ⚠️ IMPORTANTE: false en producción
      logging: ['error', 'warn'],
      // Configuración optimizada para Vercel
      poolSize: 10,
      connectTimeoutMS: 10000,
      migrationsRun: true,
    };
  }

  // ✅ POSTGRESQL LOCAL (DESARROLLO)
  console.log('💻 Using PostgreSQL local (Development)');

  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'Danger4587'),
    database: configService.get('DB_NAME', 'commissions_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
    ssl: false,
  };
};
