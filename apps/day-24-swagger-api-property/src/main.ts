import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Day24SwaggerApiPropertyModule } from './day-24-swagger-api-property.module';

async function bootstrap() {
  const app = await NestFactory.create(Day24SwaggerApiPropertyModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Day 24｜Swagger DTO Metadata Debug')
    .setDescription(
      '一支端點示範一個 Swagger metadata 坑：所有端點的 runtime 行為都一樣，差別只在 OpenAPI schema。',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
