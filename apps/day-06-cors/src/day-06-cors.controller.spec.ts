import { Test, TestingModule } from '@nestjs/testing';
import { Day06CorsController } from './day-06-cors.controller';
import { Day06CorsService } from './day-06-cors.service';

describe('Day06CorsController', () => {
  let day06CorsController: Day06CorsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day06CorsController],
      providers: [Day06CorsService],
    }).compile();

    day06CorsController = app.get<Day06CorsController>(Day06CorsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day06CorsController.getHello()).toBe('Hello World!');
    });
  });
});
