import { NestFactory } from '@nestjs/core';
import { Day10NestedDtoValidationModule } from './day-10-nested-dto-validation.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(Day10NestedDtoValidationModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
