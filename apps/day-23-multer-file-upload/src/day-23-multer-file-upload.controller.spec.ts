import { Test, TestingModule } from '@nestjs/testing';
import { Day23MulterFileUploadController } from './day-23-multer-file-upload.controller';
import { Day23MulterFileUploadService } from './day-23-multer-file-upload.service';

describe('Day23MulterFileUploadController', () => {
  let day23MulterFileUploadController: Day23MulterFileUploadController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day23MulterFileUploadController],
      providers: [Day23MulterFileUploadService],
    }).compile();

    day23MulterFileUploadController = app.get<Day23MulterFileUploadController>(Day23MulterFileUploadController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day23MulterFileUploadController.getHello()).toBe('Hello World!');
    });
  });
});
