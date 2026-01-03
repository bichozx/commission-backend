/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import * as swaggerUi from 'swagger-ui-dist';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';

//import { ValidationPipe } from '@nestjs/common';

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

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//   });

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//       forbidNonWhitelisted: true,
//     }),
//   );

//   const config = new DocumentBuilder()
//     .setTitle('Commission System API')
//     .setDescription('Multi-level affiliate commission management system')
//     .setVersion('1.0')
//     .addTag('auth')
//     .addBearerAuth()
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document);

//   const port = process.env.PORT || 3001;
//   await app.listen(port);

//   console.log(`🚀 Server running on http://localhost:${port}`);
// }

// bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//   });

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//       forbidNonWhitelisted: true,
//     }),
//   );

//   const config = new DocumentBuilder()
//     .setTitle('Commission System API')
//     .setDescription('Multi-level affiliate commission management system')
//     .setVersion('1.0')
//     .addTag('auth')
//     .addBearerAuth()
//     .build();

//   const document = SwaggerModule.createDocument(app, config);

//   SwaggerModule.setup('api/docs', app, document, {
//     customCssUrl: 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
//     customJs: [
//       'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js',
//       'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
//     ],
//   });
//   const port = process.env.PORT || 3001;
//   await app.listen(port);

//   console.log(`🚀 Server running on port ${port}`);
// }

// bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    customCssUrl: join(swaggerUi.getAbsoluteFSPath(), 'swagger-ui.css'),
    customJs: [
      join(swaggerUi.getAbsoluteFSPath(), 'swagger-ui-bundle.js'),
      join(swaggerUi.getAbsoluteFSPath(), 'swagger-ui-standalone-preset.js'),
    ],
  });

  await app.listen(3001);
}

bootstrap();
