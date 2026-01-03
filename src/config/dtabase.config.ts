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
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (isProduction) {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined');
    }

    console.log('🚀 Using PostgreSQL on Supabase (Production)');

    return {
      type: 'postgres',
      url: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      autoLoadEntities: true,
      synchronize: false,
      logging: ['error'],
    };
  }

  // 💻 DESARROLLO LOCAL
  console.log('💻 Using PostgreSQL local (Development)');

  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: Number(configService.get('DB_PORT', 5432)),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME', 'commissions_db'),
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
    ssl: false,
  };
};
