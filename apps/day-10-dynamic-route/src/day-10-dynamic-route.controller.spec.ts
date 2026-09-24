import { Test, TestingModule } from '@nestjs/testing';
import { Day10DynamicRouteController } from './day-10-dynamic-route.controller';
import { Day10DynamicRouteService } from './day-10-dynamic-route.service';

describe('Day10DynamicRouteController', () => {
  let day10DynamicRouteController: Day10DynamicRouteController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day10DynamicRouteController],
      providers: [Day10DynamicRouteService],
    }).compile();

    day10DynamicRouteController = app.get<Day10DynamicRouteController>(Day10DynamicRouteController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day10DynamicRouteController.getHello()).toBe('Hello World!');
    });
  });
});
