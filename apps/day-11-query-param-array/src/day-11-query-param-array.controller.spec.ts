import { Test, TestingModule } from '@nestjs/testing';
import { Day11QueryParamArrayController } from './day-11-query-param-array.controller';
import { Day11QueryParamArrayService } from './day-11-query-param-array.service';

describe('Day11QueryParamArrayController', () => {
  let day11QueryParamArrayController: Day11QueryParamArrayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day11QueryParamArrayController],
      providers: [Day11QueryParamArrayService],
    }).compile();

    day11QueryParamArrayController = app.get<Day11QueryParamArrayController>(Day11QueryParamArrayController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day11QueryParamArrayController.getHello()).toBe('Hello World!');
    });
  });
});
