/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// import { AppModule } from './app.module';
// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // CORS
//   app.enableCors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//   });

//   // Validación global
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//       forbidNonWhitelisted: true,
//     }),
//   );

//   // Configuración Swagger
//   const config = new DocumentBuilder()
//     .setTitle('Commission System API')
//     .setDescription('Multi-level affiliate commission management system')
//     .setVersion('1.0')
//     .addTag('auth', 'Authentication endpoints')
//     .addBearerAuth()
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document);

//   const port = process.env.PORT || 3001;
//   await app.listen(port);

//   console.log(`🚀 Server running on: http://localhost:${port}`);
//   console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
// }

// bootstrap();

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración Swagger - solo en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Commission System API')
      .setDescription('Multi-level affiliate commission management system')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;

  // ⚠️ IMPORTANTE: Para Vercel, necesitamos exportar el handler
  if (process.env.NODE_ENV === 'production') {
    // En producción (Vercel), solo iniciamos la app
    await app.init();
    return app.getHttpAdapter().getInstance();
  }

  // En desarrollo, escuchamos normalmente
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);

  return app;
}

// ⚠️ CRÍTICO: Exporta la función bootstrap para Vercel
export { bootstrap };

// Solo ejecuta bootstrap() si no estamos en un entorno de importación
// Esto permite que Vercel use la exportación
if (require.main === module) {
  bootstrap()
    .then((app) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Application started successfully');
      }
    })
    .catch((error) => {
      console.error('❌ Failed to start application:', error);
      process.exit(1);
    });
}
