import { Test, TestingModule } from '@nestjs/testing';
import { Day21EnvJoiValidationController } from './day-21-env-joi-validation.controller';
import { Day21EnvJoiValidationService } from './day-21-env-joi-validation.service';

describe('Day21EnvJoiValidationController', () => {
  let day21EnvJoiValidationController: Day21EnvJoiValidationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day21EnvJoiValidationController],
      providers: [Day21EnvJoiValidationService],
    }).compile();

    day21EnvJoiValidationController = app.get<Day21EnvJoiValidationController>(Day21EnvJoiValidationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day21EnvJoiValidationController.getHello()).toBe('Hello World!');
    });
  });
});
