import { NestFactory } from '@nestjs/core';
import { Day03CircularDependencyModule } from './day-03-circular-dependency.module';

async function bootstrap() {
  const app = await NestFactory.create(Day03CircularDependencyModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
