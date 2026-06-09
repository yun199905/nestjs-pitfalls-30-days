import { NestFactory } from '@nestjs/core';
import { Day07DtoRuntimeMetadataModule } from './day-07-dto-runtime-metadata.module';

async function bootstrap() {
  const app = await NestFactory.create(Day07DtoRuntimeMetadataModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
