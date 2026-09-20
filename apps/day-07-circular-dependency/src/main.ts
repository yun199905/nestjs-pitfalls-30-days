import { NestFactory } from '@nestjs/core';
import { Day07CircularDependencyModule } from './day-07-circular-dependency.module';

async function bootstrap() {
  const app = await NestFactory.create(Day07CircularDependencyModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
