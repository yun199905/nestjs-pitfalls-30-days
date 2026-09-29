import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Day15IsOptionalModule } from './day-15-is-optional.module';

async function bootstrap() {
  const app = await NestFactory.create(Day15IsOptionalModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
