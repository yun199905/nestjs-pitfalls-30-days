import { NestFactory } from '@nestjs/core';
import { Day10DynamicRouteModule } from './day-10-dynamic-route.module';

async function bootstrap() {
  const app = await NestFactory.create(Day10DynamicRouteModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
