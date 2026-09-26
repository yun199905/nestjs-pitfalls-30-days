import { NestFactory } from '@nestjs/core';
import { Day15QueryParamArrayModule } from './day-15-query-param-array.module';

async function bootstrap() {
  const app = await NestFactory.create(Day15QueryParamArrayModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
