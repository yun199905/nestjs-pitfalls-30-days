import { NestFactory } from '@nestjs/core';
import { Day06CorsModule } from './day-06-cors.module';

async function bootstrap() {
  const app = await NestFactory.create(Day06CorsModule);

  // Wrong example for the article:
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Correct example:
  // app.enableCors({
  //   origin: ['http://localhost:5173'],
  //   credentials: true,
  //   methods: ['GET', 'POST', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  // });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
