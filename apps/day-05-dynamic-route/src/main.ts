import { NestFactory } from '@nestjs/core';
import { Day05DynamicRouteModule } from './day-05-dynamic-route.module';

async function bootstrap() {
  const app = await NestFactory.create(Day05DynamicRouteModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
