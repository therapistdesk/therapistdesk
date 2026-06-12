import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('DB URL:', process.env.DATABASE_URL);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ValidationPipe } from '@nestjs/common';

const prisma = new PrismaClient();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.use(bodyParser.json()); // 🔥 това е ключът
  app.use(bodyParser.urlencoded({ extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // маха излишни полета
      forbidNonWhitelisted: true, // грешка ако има излишни
      transform: true,          // auto cast (string → number)
    }),
  );

  await app.listen(3000);
}
bootstrap();