import { NestFactory } from '@nestjs/core';
import { Day22MultiEnvConfigModule } from './day-22-multi-env-config.module';

async function bootstrap() {
  const app = await NestFactory.create(Day22MultiEnvConfigModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
