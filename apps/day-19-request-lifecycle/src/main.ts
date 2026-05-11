import { NestFactory } from '@nestjs/core';
import { Day19RequestLifecycleModule } from './day-19-request-lifecycle.module';

async function bootstrap() {
  const app = await NestFactory.create(Day19RequestLifecycleModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
