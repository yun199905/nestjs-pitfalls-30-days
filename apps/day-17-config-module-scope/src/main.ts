import { NestFactory } from '@nestjs/core';
import { Day17ConfigModuleScopeModule } from './day-17-config-module-scope.module';

async function bootstrap() {
  const app = await NestFactory.create(Day17ConfigModuleScopeModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
