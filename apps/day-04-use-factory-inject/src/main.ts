import { NestFactory } from '@nestjs/core';
import { Day04UseFactoryInjectModule } from './day-04-use-factory-inject.module';

async function bootstrap() {
  const app = await NestFactory.create(Day04UseFactoryInjectModule);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
