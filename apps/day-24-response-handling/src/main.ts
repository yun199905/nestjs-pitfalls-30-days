import { NestFactory } from '@nestjs/core';
import { Day24ResponseHandlingModule } from './day-24-response-handling.module';

async function bootstrap() {
  const app = await NestFactory.create(Day24ResponseHandlingModule);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
