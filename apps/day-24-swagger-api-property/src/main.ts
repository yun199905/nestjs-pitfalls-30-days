import { NestFactory } from '@nestjs/core';
import { Day24SwaggerApiPropertyModule } from './day-24-swagger-api-property.module';

async function bootstrap() {
  const app = await NestFactory.create(Day24SwaggerApiPropertyModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
