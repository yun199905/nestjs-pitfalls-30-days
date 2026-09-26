import { NestFactory } from '@nestjs/core';
import { Day16NestedDtoValidationModule } from './day-16-nested-dto-validation.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(Day16NestedDtoValidationModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
