import { Test, TestingModule } from '@nestjs/testing';
import { Day16TbdController } from './day-16-tbd.controller';
import { Day16TbdService } from './day-16-tbd.service';

describe('Day16TbdController', () => {
  let day16TbdController: Day16TbdController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day16TbdController],
      providers: [Day16TbdService],
    }).compile();

    day16TbdController = app.get<Day16TbdController>(Day16TbdController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day16TbdController.getHello()).toBe('Hello World!');
    });
  });
});
