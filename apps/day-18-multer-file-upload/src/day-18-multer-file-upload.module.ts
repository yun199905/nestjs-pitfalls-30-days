import { Module } from '@nestjs/common';
import { Day18MulterFileUploadController } from './day-18-multer-file-upload.controller';

@Module({
  controllers: [Day18MulterFileUploadController],
})
export class Day18MulterFileUploadModule {}
