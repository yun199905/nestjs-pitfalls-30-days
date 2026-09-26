import { NestFactory } from '@nestjs/core';
import { Day12DtoRuntimeMetadataModule } from './day-12-dto-runtime-metadata.module';

async function bootstrap() {
  const app = await NestFactory.create(Day12DtoRuntimeMetadataModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
