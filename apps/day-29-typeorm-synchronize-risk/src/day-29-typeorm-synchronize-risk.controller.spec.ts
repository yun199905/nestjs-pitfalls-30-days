import { Test, TestingModule } from '@nestjs/testing';
import { Day29TypeormSynchronizeRiskController } from './day-29-typeorm-synchronize-risk.controller';
import { Day29TypeormSynchronizeRiskService } from './day-29-typeorm-synchronize-risk.service';

describe('Day29TypeormSynchronizeRiskController', () => {
  let day29TypeormSynchronizeRiskController: Day29TypeormSynchronizeRiskController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day29TypeormSynchronizeRiskController],
      providers: [Day29TypeormSynchronizeRiskService],
    }).compile();

    day29TypeormSynchronizeRiskController = app.get<Day29TypeormSynchronizeRiskController>(Day29TypeormSynchronizeRiskController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day29TypeormSynchronizeRiskController.getHello()).toBe('Hello World!');
    });
  });
});
