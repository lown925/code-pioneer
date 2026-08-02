import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync, mkdirSync } from 'fs';
import express from 'express';
import { AppModule } from './app.module';
import { validateEnvironmentConfiguration } from './environment/environment.config';
import { createEnvironmentMiddleware } from './environment/environment.middleware';

async function bootstrap() {
  const environmentConfig = validateEnvironmentConfiguration();
  const app = await NestFactory.create(AppModule);

  if (!existsSync(environmentConfig.uploadStorageRoot)) {
    mkdirSync(environmentConfig.uploadStorageRoot, { recursive: true });
  }

  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.use(createEnvironmentMiddleware(environmentConfig));
  app.use('/uploads', express.static(environmentConfig.uploadStorageRoot));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
