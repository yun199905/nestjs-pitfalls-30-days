import { NestFactory } from '@nestjs/core';
import { Day12ArrayDtoValidationModule } from './day-12-array-dto-validation.module';

async function bootstrap() {
  const app = await NestFactory.create(Day12ArrayDtoValidationModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
