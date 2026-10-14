import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Day29SwaggerComplexTypesModule } from './day-29-swagger-complex-types.module';

async function bootstrap() {
  const app = await NestFactory.create(Day29SwaggerComplexTypesModule);

  const config = new DocumentBuilder()
    .setTitle('Day 29｜Swagger Complex Types Debug')
    .setDescription(
      '比較 runtime 都能接收同一份 JSON，但 OpenAPI 對 array 與 nested DTO 描述完整度不同的兩組建立文章端點。',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
