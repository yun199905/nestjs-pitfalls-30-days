import { Test, TestingModule } from '@nestjs/testing';
import { Day26JsonStringifyEntityCycleController } from './day-26-json-stringify-entity-cycle.controller';
import { Day26JsonStringifyEntityCycleService } from './day-26-json-stringify-entity-cycle.service';

describe('Day26JsonStringifyEntityCycleController', () => {
  let day26JsonStringifyEntityCycleController: Day26JsonStringifyEntityCycleController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day26JsonStringifyEntityCycleController],
      providers: [Day26JsonStringifyEntityCycleService],
    }).compile();

    day26JsonStringifyEntityCycleController = app.get<Day26JsonStringifyEntityCycleController>(Day26JsonStringifyEntityCycleController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day26JsonStringifyEntityCycleController.getHello()).toBe('Hello World!');
    });
  });
});
