import { Controller, Get } from '@nestjs/common';
import { Day23MulterFileUploadService } from './day-23-multer-file-upload.service';

@Controller()
export class Day23MulterFileUploadController {
  constructor(private readonly day23MulterFileUploadService: Day23MulterFileUploadService) {}

  @Get()
  getHello(): string {
    return this.day23MulterFileUploadService.getHello();
  }
}
