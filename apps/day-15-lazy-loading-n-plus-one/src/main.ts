import { NestFactory } from '@nestjs/core';
import { Day15LazyLoadingNPlusOneModule } from './day-15-lazy-loading-n-plus-one.module';

async function bootstrap() {
  const app = await NestFactory.create(Day15LazyLoadingNPlusOneModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
