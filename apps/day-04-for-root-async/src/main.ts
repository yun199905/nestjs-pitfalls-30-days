import { NestFactory } from '@nestjs/core';
import { Day04ForRootAsyncModule } from './day-04-for-root-async.module';

async function bootstrap() {
  const app = await NestFactory.create(Day04ForRootAsyncModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
