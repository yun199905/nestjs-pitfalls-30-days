import { NestFactory } from '@nestjs/core';
import { Day18MulterFileUploadModule } from './day-18-multer-file-upload.module';

async function bootstrap() {
  const app = await NestFactory.create(Day18MulterFileUploadModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
