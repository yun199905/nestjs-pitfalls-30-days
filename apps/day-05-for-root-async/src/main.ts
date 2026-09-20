import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Day05ForRootAsyncModule } from './day-05-for-root-async.module';

async function bootstrap() {
  const app = await NestFactory.create(Day05ForRootAsyncModule);
  await app.listen(process.env.PORT ?? 3000);
  Logger.log('Application is ready', 'Bootstrap');
}
void bootstrap();
