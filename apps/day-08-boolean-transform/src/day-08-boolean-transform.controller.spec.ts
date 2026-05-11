import { Test, TestingModule } from '@nestjs/testing';
import { Day08BooleanTransformController } from './day-08-boolean-transform.controller';
import { Day08BooleanTransformService } from './day-08-boolean-transform.service';

describe('Day08BooleanTransformController', () => {
  let day08BooleanTransformController: Day08BooleanTransformController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day08BooleanTransformController],
      providers: [Day08BooleanTransformService],
    }).compile();

    day08BooleanTransformController = app.get<Day08BooleanTransformController>(Day08BooleanTransformController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day08BooleanTransformController.getHello()).toBe('Hello World!');
    });
  });
});
