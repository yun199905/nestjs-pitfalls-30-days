import { Test, TestingModule } from '@nestjs/testing';
import { Day12ArrayDtoValidationController } from './day-12-array-dto-validation.controller';
import { Day12ArrayDtoValidationService } from './day-12-array-dto-validation.service';

describe('Day12ArrayDtoValidationController', () => {
  let day12ArrayDtoValidationController: Day12ArrayDtoValidationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day12ArrayDtoValidationController],
      providers: [Day12ArrayDtoValidationService],
    }).compile();

    day12ArrayDtoValidationController = app.get<Day12ArrayDtoValidationController>(Day12ArrayDtoValidationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day12ArrayDtoValidationController.getHello()).toBe('Hello World!');
    });
  });
});
