import { NestFactory } from '@nestjs/core';
import { Day06CorsModule } from './day-06-cors.module';

async function bootstrap() {
  const app = await NestFactory.create(Day06CorsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
