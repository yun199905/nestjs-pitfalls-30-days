import { Test, TestingModule } from '@nestjs/testing';
import { Day14TypeormForFeatureController } from './day-14-typeorm-for-feature.controller';
import { Day14TypeormForFeatureService } from './day-14-typeorm-for-feature.service';

describe('Day14TypeormForFeatureController', () => {
  let day14TypeormForFeatureController: Day14TypeormForFeatureController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day14TypeormForFeatureController],
      providers: [Day14TypeormForFeatureService],
    }).compile();

    day14TypeormForFeatureController = app.get<Day14TypeormForFeatureController>(Day14TypeormForFeatureController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day14TypeormForFeatureController.getHello()).toBe('Hello World!');
    });
  });
});
