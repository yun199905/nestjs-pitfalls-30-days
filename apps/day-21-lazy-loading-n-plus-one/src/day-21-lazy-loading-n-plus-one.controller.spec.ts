import { Test, TestingModule } from '@nestjs/testing';
import { Day21LazyLoadingNPlusOneController } from './day-21-lazy-loading-n-plus-one.controller';
import { Day21LazyLoadingNPlusOneService } from './day-21-lazy-loading-n-plus-one.service';

describe('Day21LazyLoadingNPlusOneController', () => {
  let day21LazyLoadingNPlusOneController: Day21LazyLoadingNPlusOneController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day21LazyLoadingNPlusOneController],
      providers: [Day21LazyLoadingNPlusOneService],
    }).compile();

    day21LazyLoadingNPlusOneController = app.get<Day21LazyLoadingNPlusOneController>(Day21LazyLoadingNPlusOneController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day21LazyLoadingNPlusOneController.getHello()).toBe('Hello World!');
    });
  });
});
