import { NestFactory } from '@nestjs/core';
import { Day11QueryParamArrayModule } from './day-11-query-param-array.module';

async function bootstrap() {
  const app = await NestFactory.create(Day11QueryParamArrayModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
