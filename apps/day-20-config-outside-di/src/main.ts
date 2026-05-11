import { NestFactory } from '@nestjs/core';
import { Day20ConfigOutsideDiModule } from './day-20-config-outside-di.module';

async function bootstrap() {
  const app = await NestFactory.create(Day20ConfigOutsideDiModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
