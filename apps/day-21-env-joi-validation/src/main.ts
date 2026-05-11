import { NestFactory } from '@nestjs/core';
import { Day21EnvJoiValidationModule } from './day-21-env-joi-validation.module';

async function bootstrap() {
  const app = await NestFactory.create(Day21EnvJoiValidationModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
