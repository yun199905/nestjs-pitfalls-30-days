import { NestFactory } from '@nestjs/core';
import { Day08BooleanTransformModule } from './day-08-boolean-transform.module';

async function bootstrap() {
  const app = await NestFactory.create(Day08BooleanTransformModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
