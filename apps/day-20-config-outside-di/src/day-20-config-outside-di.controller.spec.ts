import { Test, TestingModule } from '@nestjs/testing';
import { Day20ConfigOutsideDiController } from './day-20-config-outside-di.controller';
import { Day20ConfigOutsideDiService } from './day-20-config-outside-di.service';

describe('Day20ConfigOutsideDiController', () => {
  let day20ConfigOutsideDiController: Day20ConfigOutsideDiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day20ConfigOutsideDiController],
      providers: [Day20ConfigOutsideDiService],
    }).compile();

    day20ConfigOutsideDiController = app.get<Day20ConfigOutsideDiController>(Day20ConfigOutsideDiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day20ConfigOutsideDiController.getHello()).toBe('Hello World!');
    });
  });
});
