import { NestFactory } from '@nestjs/core';
import { Day16BooleanTransformModule } from './day-16-boolean-transform.module';

async function bootstrap() {
  const app = await NestFactory.create(Day16BooleanTransformModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
