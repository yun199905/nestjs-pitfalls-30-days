import { NestFactory } from '@nestjs/core';
import { Day07ValidationPipeBodyModule } from './day-07-validation-pipe-body.module';

async function bootstrap() {
  const app = await NestFactory.create(Day07ValidationPipeBodyModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
