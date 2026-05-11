import { NestFactory } from '@nestjs/core';
import { Day18TransactionRollbackModule } from './day-18-transaction-rollback.module';

async function bootstrap() {
  const app = await NestFactory.create(Day18TransactionRollbackModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
