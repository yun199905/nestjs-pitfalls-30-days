import { Test, TestingModule } from '@nestjs/testing';
import { Day19RequestLifecycleController } from './day-19-request-lifecycle.controller';
import { Day19RequestLifecycleService } from './day-19-request-lifecycle.service';

describe('Day19RequestLifecycleController', () => {
  let day19RequestLifecycleController: Day19RequestLifecycleController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day19RequestLifecycleController],
      providers: [Day19RequestLifecycleService],
    }).compile();

    day19RequestLifecycleController = app.get<Day19RequestLifecycleController>(Day19RequestLifecycleController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day19RequestLifecycleController.getHello()).toBe('Hello World!');
    });
  });
});
