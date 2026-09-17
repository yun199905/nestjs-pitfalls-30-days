import { NestFactory } from '@nestjs/core';
import { Day03ManualNewServiceModule } from './day-03-manual-new-service.module';

async function bootstrap() {
  const app = await NestFactory.create(Day03ManualNewServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
