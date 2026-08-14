import { Test, TestingModule } from '@nestjs/testing';
import { Day15LazyLoadingNPlusOneController } from './day-15-lazy-loading-n-plus-one.controller';
import { Day15LazyLoadingNPlusOneService } from './day-15-lazy-loading-n-plus-one.service';

describe('Day15LazyLoadingNPlusOneController', () => {
  let day15LazyLoadingNPlusOneController: Day15LazyLoadingNPlusOneController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day15LazyLoadingNPlusOneController],
      providers: [Day15LazyLoadingNPlusOneService],
    }).compile();

    day15LazyLoadingNPlusOneController = app.get<Day15LazyLoadingNPlusOneController>(Day15LazyLoadingNPlusOneController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day15LazyLoadingNPlusOneController.getHello()).toBe('Hello World!');
    });
  });
});
