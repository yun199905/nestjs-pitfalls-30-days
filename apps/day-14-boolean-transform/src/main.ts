import { NestFactory } from '@nestjs/core';
import { Day14BooleanTransformModule } from './day-14-boolean-transform.module';

async function bootstrap() {
  const app = await NestFactory.create(Day14BooleanTransformModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
