import { NestFactory } from '@nestjs/core';
import { Day25SwaggerJwtBearerModule } from './day-25-swagger-jwt-bearer.module';

async function bootstrap() {
  const app = await NestFactory.create(Day25SwaggerJwtBearerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
