import { NestFactory } from '@nestjs/core';
import { Day02ProviderDependencyModule } from './day-02-provider-dependency.module';

async function bootstrap() {
  const app = await NestFactory.create(Day02ProviderDependencyModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
