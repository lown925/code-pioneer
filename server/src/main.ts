import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const uploadRoot = join(process.cwd(), 'public');

  if (!existsSync(uploadRoot)) {
    mkdirSync(uploadRoot, { recursive: true });
  }

  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.use('/uploads', express.static(join(uploadRoot, 'uploads')));
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
