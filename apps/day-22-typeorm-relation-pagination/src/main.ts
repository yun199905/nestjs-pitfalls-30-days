import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Day22TypeormRelationPaginationModule } from './day-22-typeorm-relation-pagination.module';

async function bootstrap() {
  const app = await NestFactory.create(Day22TypeormRelationPaginationModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
