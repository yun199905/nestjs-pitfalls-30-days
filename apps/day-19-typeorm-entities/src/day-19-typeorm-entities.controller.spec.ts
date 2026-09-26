import { Test, TestingModule } from '@nestjs/testing';
import { Day19TypeormEntitiesController } from './day-19-typeorm-entities.controller';
import { Day19TypeormEntitiesService } from './day-19-typeorm-entities.service';

describe('Day19TypeormEntitiesController', () => {
  let day19TypeormEntitiesController: Day19TypeormEntitiesController;
  const day19TypeormEntitiesService = {
    getHello: jest.fn(() => 'Hello World!'),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day19TypeormEntitiesController],
      providers: [
        {
          provide: Day19TypeormEntitiesService,
          useValue: day19TypeormEntitiesService,
        },
      ],
    }).compile();

    day19TypeormEntitiesController = app.get<Day19TypeormEntitiesController>(
      Day19TypeormEntitiesController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day19TypeormEntitiesController.getHello()).toBe('Hello World!');
    });
  });
});
