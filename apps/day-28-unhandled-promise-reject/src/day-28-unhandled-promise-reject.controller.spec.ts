import { Test, TestingModule } from '@nestjs/testing';
import { Day28UnhandledPromiseRejectController } from './day-28-unhandled-promise-reject.controller';
import { Day28UnhandledPromiseRejectService } from './day-28-unhandled-promise-reject.service';

describe('Day28UnhandledPromiseRejectController', () => {
  let day28UnhandledPromiseRejectController: Day28UnhandledPromiseRejectController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day28UnhandledPromiseRejectController],
      providers: [Day28UnhandledPromiseRejectService],
    }).compile();

    day28UnhandledPromiseRejectController = app.get<Day28UnhandledPromiseRejectController>(Day28UnhandledPromiseRejectController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day28UnhandledPromiseRejectController.getHello()).toBe('Hello World!');
    });
  });
});
