import { Test, TestingModule } from '@nestjs/testing';
import { Day07ValidationPipeBodyController } from './day-07-validation-pipe-body.controller';
import { Day07ValidationPipeBodyService } from './day-07-validation-pipe-body.service';

describe('Day07ValidationPipeBodyController', () => {
  let day07ValidationPipeBodyController: Day07ValidationPipeBodyController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day07ValidationPipeBodyController],
      providers: [Day07ValidationPipeBodyService],
    }).compile();

    day07ValidationPipeBodyController = app.get<Day07ValidationPipeBodyController>(Day07ValidationPipeBodyController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day07ValidationPipeBodyController.getHello()).toBe('Hello World!');
    });
  });
});
