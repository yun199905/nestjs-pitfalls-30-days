import { Test, TestingModule } from '@nestjs/testing';
import { Day05DynamicRouteController } from './day-05-dynamic-route.controller';
import { Day05DynamicRouteService } from './day-05-dynamic-route.service';

describe('Day05DynamicRouteController', () => {
  let day05DynamicRouteController: Day05DynamicRouteController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day05DynamicRouteController],
      providers: [Day05DynamicRouteService],
    }).compile();

    day05DynamicRouteController = app.get<Day05DynamicRouteController>(Day05DynamicRouteController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day05DynamicRouteController.getHello()).toBe('Hello World!');
    });
  });
});
