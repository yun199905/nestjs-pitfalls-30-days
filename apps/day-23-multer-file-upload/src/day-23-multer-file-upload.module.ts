import { Module } from '@nestjs/common';
import { Day23MulterFileUploadController } from './day-23-multer-file-upload.controller';
import { Day23MulterFileUploadService } from './day-23-multer-file-upload.service';

@Module({
  imports: [],
  controllers: [Day23MulterFileUploadController],
  providers: [Day23MulterFileUploadService],
})
export class Day23MulterFileUploadModule {}
