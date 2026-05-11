import { NestFactory } from '@nestjs/core';
import { Day16LazyLoadingNPlusOneModule } from './day-16-lazy-loading-n-plus-one.module';

async function bootstrap() {
  const app = await NestFactory.create(Day16LazyLoadingNPlusOneModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
