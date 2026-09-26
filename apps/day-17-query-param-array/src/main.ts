import { NestFactory } from '@nestjs/core';
import { Day17QueryParamArrayModule } from './day-17-query-param-array.module';

async function bootstrap() {
  const app = await NestFactory.create(Day17QueryParamArrayModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
