import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Day 13｜ValidationPipe transform 對照練習')
    .setDescription(
      '用同一份建立文章 payload，比較 transform: false、transform: true，以及 transform: false + whitelist: true 的 runtime 差異。',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
}
