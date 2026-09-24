import { NestFactory } from '@nestjs/core';
import { Day05ConfigModuleScopeModule } from './day-05-config-module-scope.module';

async function bootstrap() {
  const app = await NestFactory.create(Day05ConfigModuleScopeModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
