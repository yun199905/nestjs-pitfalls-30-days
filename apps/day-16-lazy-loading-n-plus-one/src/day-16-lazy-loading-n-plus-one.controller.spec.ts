import { Test, TestingModule } from '@nestjs/testing';
import { Day16LazyLoadingNPlusOneController } from './day-16-lazy-loading-n-plus-one.controller';
import { Day16LazyLoadingNPlusOneService } from './day-16-lazy-loading-n-plus-one.service';

describe('Day16LazyLoadingNPlusOneController', () => {
  let day16LazyLoadingNPlusOneController: Day16LazyLoadingNPlusOneController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day16LazyLoadingNPlusOneController],
      providers: [Day16LazyLoadingNPlusOneService],
    }).compile();

    day16LazyLoadingNPlusOneController = app.get<Day16LazyLoadingNPlusOneController>(Day16LazyLoadingNPlusOneController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day16LazyLoadingNPlusOneController.getHello()).toBe('Hello World!');
    });
  });
});
