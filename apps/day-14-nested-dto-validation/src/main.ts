import { NestFactory } from '@nestjs/core';
import { Day14NestedDtoValidationModule } from './day-14-nested-dto-validation.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(Day14NestedDtoValidationModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
