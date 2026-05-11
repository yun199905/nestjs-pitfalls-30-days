import { Test, TestingModule } from '@nestjs/testing';
import { Day10NestedDtoValidationController } from './day-10-nested-dto-validation.controller';
import { Day10NestedDtoValidationService } from './day-10-nested-dto-validation.service';

describe('Day10NestedDtoValidationController', () => {
  let day10NestedDtoValidationController: Day10NestedDtoValidationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day10NestedDtoValidationController],
      providers: [Day10NestedDtoValidationService],
    }).compile();

    day10NestedDtoValidationController = app.get<Day10NestedDtoValidationController>(Day10NestedDtoValidationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day10NestedDtoValidationController.getHello()).toBe('Hello World!');
    });
  });
});
