import { Test, TestingModule } from '@nestjs/testing';
import { Day04ForRootAsyncController } from './day-04-for-root-async.controller';
import { Day04ForRootAsyncService } from './day-04-for-root-async.service';

describe('Day04ForRootAsyncController', () => {
  let day04ForRootAsyncController: Day04ForRootAsyncController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day04ForRootAsyncController],
      providers: [Day04ForRootAsyncService],
    }).compile();

    day04ForRootAsyncController = app.get<Day04ForRootAsyncController>(Day04ForRootAsyncController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day04ForRootAsyncController.getHello()).toBe('Hello World!');
    });
  });
});
