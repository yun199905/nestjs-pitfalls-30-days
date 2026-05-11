import { Test, TestingModule } from '@nestjs/testing';
import { Day17ConfigInitOrderController } from './day-17-config-init-order.controller';
import { Day17ConfigInitOrderService } from './day-17-config-init-order.service';

describe('Day17ConfigInitOrderController', () => {
  let day17ConfigInitOrderController: Day17ConfigInitOrderController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day17ConfigInitOrderController],
      providers: [Day17ConfigInitOrderService],
    }).compile();

    day17ConfigInitOrderController = app.get<Day17ConfigInitOrderController>(Day17ConfigInitOrderController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day17ConfigInitOrderController.getHello()).toBe('Hello World!');
    });
  });
});
