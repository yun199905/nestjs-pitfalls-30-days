import { NestFactory } from '@nestjs/core';
import { Day19TypeormEntitiesModule } from './day-19-typeorm-entities.module';

async function bootstrap() {
  const app = await NestFactory.create(Day19TypeormEntitiesModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
