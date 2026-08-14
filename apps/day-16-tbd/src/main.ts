import { NestFactory } from '@nestjs/core';
import { Day16TbdModule } from './day-16-tbd.module';

async function bootstrap() {
  const app = await NestFactory.create(Day16TbdModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
