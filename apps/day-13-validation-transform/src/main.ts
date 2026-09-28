import { NestFactory } from '@nestjs/core';
import { Day13ValidationTransformModule } from './day-13-validation-transform.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(Day13ValidationTransformModule);

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
