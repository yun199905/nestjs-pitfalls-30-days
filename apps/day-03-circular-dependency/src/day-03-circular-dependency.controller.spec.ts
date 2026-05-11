import { Test, TestingModule } from '@nestjs/testing';
import { Day03CircularDependencyController } from './day-03-circular-dependency.controller';
import { Day03CircularDependencyService } from './day-03-circular-dependency.service';

describe('Day03CircularDependencyController', () => {
  let day03CircularDependencyController: Day03CircularDependencyController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day03CircularDependencyController],
      providers: [Day03CircularDependencyService],
    }).compile();

    day03CircularDependencyController = app.get<Day03CircularDependencyController>(Day03CircularDependencyController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day03CircularDependencyController.getHello()).toBe('Hello World!');
    });
  });
});
