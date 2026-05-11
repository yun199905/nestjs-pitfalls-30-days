import { NestFactory } from '@nestjs/core';
import { Day10NestedDtoValidationModule } from './day-10-nested-dto-validation.module';

async function bootstrap() {
  const app = await NestFactory.create(Day10NestedDtoValidationModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
