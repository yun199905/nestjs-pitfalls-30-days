import { NestFactory } from '@nestjs/core';
import { Day12NestedDtoValidationModule } from './day-12-nested-dto-validation.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(Day12NestedDtoValidationModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
