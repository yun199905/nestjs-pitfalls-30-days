import { NestFactory } from '@nestjs/core';
import { Day26JsonStringifyEntityCycleModule } from './day-26-json-stringify-entity-cycle.module';

async function bootstrap() {
  const app = await NestFactory.create(Day26JsonStringifyEntityCycleModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
