import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  const PORT = configService.get('PORT') || 8080;

  const logger = new Logger('bootstrap');

  // app.enableCors({
  //   origin: CORS_HOSTS[NODE_ENV],
  //   credentials: true,
  // });
  // app.enableCors({
  //   origin: 'http://localhost:3000',

  //   credentials: true,
  // });
  // app.enableCors({
  //   origin: ['http://localhost:3000'],
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  // });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('FishingApp')
    .setDescription('')
    .setVersion('1.0')
    .addServer('http://localhost:8080/', 'Local environment')
    .addServer('https://staging.yourapi.com/', 'Staging')
    .addServer('https://production.yourapi.com/', 'Production')
    .addTag('')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT, () => {
    logger.verbose(`Server is running on  ${PORT}`);
  });
}
bootstrap();
