import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync, mkdirSync } from 'fs';
import express from 'express';
import { AppModule } from './app.module';
import { createCommunityUploadBlocker } from './environment/community-upload.middleware';
import { validateEnvironmentConfiguration } from './environment/environment.config';
import { createEnvironmentMiddleware } from './environment/environment.middleware';

async function bootstrap() {
  const environmentConfig = validateEnvironmentConfiguration();
  const app = await NestFactory.create(AppModule);
  const configuredPort = process.env.PORT?.trim() || '3000';
  const port = Number(configuredPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  if (!existsSync(environmentConfig.uploadStorageRoot)) {
    mkdirSync(environmentConfig.uploadStorageRoot, { recursive: true });
  }

  app.enableCors({
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Client-Environment'],
  });
  app.setGlobalPrefix('api/v1');
  app.use(createEnvironmentMiddleware(environmentConfig));
  app.use(
    '/uploads/community',
    createCommunityUploadBlocker(environmentConfig.appEnvironment),
  );
  app.use('/uploads', express.static(environmentConfig.uploadStorageRoot));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
