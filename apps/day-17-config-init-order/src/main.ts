import { NestFactory } from '@nestjs/core';
import { Day17ConfigInitOrderModule } from './day-17-config-init-order.module';

async function bootstrap() {
  const app = await NestFactory.create(Day17ConfigInitOrderModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
