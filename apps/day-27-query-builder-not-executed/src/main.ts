import { NestFactory } from '@nestjs/core';
import { Day27QueryBuilderNotExecutedModule } from './day-27-query-builder-not-executed.module';

async function bootstrap() {
  const app = await NestFactory.create(Day27QueryBuilderNotExecutedModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
