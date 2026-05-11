import { NestFactory } from '@nestjs/core';
import { Day14TypeormForFeatureModule } from './day-14-typeorm-for-feature.module';

async function bootstrap() {
  const app = await NestFactory.create(Day14TypeormForFeatureModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
