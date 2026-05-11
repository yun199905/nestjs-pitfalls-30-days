import { NestFactory } from '@nestjs/core';
import { Day23MulterFileUploadModule } from './day-23-multer-file-upload.module';

async function bootstrap() {
  const app = await NestFactory.create(Day23MulterFileUploadModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
