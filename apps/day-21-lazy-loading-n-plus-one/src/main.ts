import { NestFactory } from '@nestjs/core';
import { Day21LazyLoadingNPlusOneModule } from './day-21-lazy-loading-n-plus-one.module';

async function bootstrap() {
  const app = await NestFactory.create(Day21LazyLoadingNPlusOneModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
