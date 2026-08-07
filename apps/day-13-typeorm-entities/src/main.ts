import { NestFactory } from '@nestjs/core';
import { Day13TypeormEntitiesModule } from './day-13-typeorm-entities.module';

async function bootstrap() {
  const app = await NestFactory.create(Day13TypeormEntitiesModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
