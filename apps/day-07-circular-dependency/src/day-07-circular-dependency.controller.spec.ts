import { Test, TestingModule } from '@nestjs/testing';
import { Day07CircularDependencyController } from './day-07-circular-dependency.controller';
import { Day07CircularDependencyService } from './day-07-circular-dependency.service';

describe('Day07CircularDependencyController', () => {
  let day07CircularDependencyController: Day07CircularDependencyController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day07CircularDependencyController],
      providers: [Day07CircularDependencyService],
    }).compile();

    day07CircularDependencyController = app.get<Day07CircularDependencyController>(Day07CircularDependencyController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day07CircularDependencyController.getHello()).toBe('Hello World!');
    });
  });
});
