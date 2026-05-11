import { NestFactory } from '@nestjs/core';
import { Day28UnhandledPromiseRejectModule } from './day-28-unhandled-promise-reject.module';

async function bootstrap() {
  const app = await NestFactory.create(Day28UnhandledPromiseRejectModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
