import { Test, TestingModule } from '@nestjs/testing';
import { Day13TypeormEntitiesController } from './day-13-typeorm-entities.controller';
import { Day13TypeormEntitiesService } from './day-13-typeorm-entities.service';

describe('Day13TypeormEntitiesController', () => {
  let day13TypeormEntitiesController: Day13TypeormEntitiesController;
  const day13TypeormEntitiesService = {
    getHello: jest.fn(() => 'Hello World!'),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day13TypeormEntitiesController],
      providers: [
        {
          provide: Day13TypeormEntitiesService,
          useValue: day13TypeormEntitiesService,
        },
      ],
    }).compile();

    day13TypeormEntitiesController = app.get<Day13TypeormEntitiesController>(
      Day13TypeormEntitiesController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day13TypeormEntitiesController.getHello()).toBe('Hello World!');
    });
  });
});
