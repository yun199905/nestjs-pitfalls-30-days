import { NestFactory } from '@nestjs/core';
import { Day25ExcludePlainObjectModule } from './day-25-exclude-plain-object.module';

async function bootstrap() {
  const app = await NestFactory.create(Day25ExcludePlainObjectModule);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
