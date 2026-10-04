import { NestFactory } from '@nestjs/core';
import { Day20TypeormSaveExtraSelectModule } from './day-20-typeorm-save-extra-select.module';

async function bootstrap() {
  const app = await NestFactory.create(Day20TypeormSaveExtraSelectModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
