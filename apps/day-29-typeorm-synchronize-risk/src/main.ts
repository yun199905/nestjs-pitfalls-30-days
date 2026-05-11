import { NestFactory } from '@nestjs/core';
import { Day29TypeormSynchronizeRiskModule } from './day-29-typeorm-synchronize-risk.module';

async function bootstrap() {
  const app = await NestFactory.create(Day29TypeormSynchronizeRiskModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
