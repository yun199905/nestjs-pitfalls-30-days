import { Test, TestingModule } from '@nestjs/testing';
import { Day08BooleanTransformController } from './day-08-boolean-transform.controller';

describe('Day08BooleanTransformController', () => {
  let day08BooleanTransformController: Day08BooleanTransformController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day08BooleanTransformController],
    }).compile();

    day08BooleanTransformController =
      app.get<Day08BooleanTransformController>(
        Day08BooleanTransformController,
      );
  });

  describe('findPostsWithImplicitBoolean', () => {
    it('should return transformed query directly', () => {
      expect(
        day08BooleanTransformController.findWithImplicitBoolean({
          isPublished: true,
        }),
      ).toEqual({ isPublished: true });
    });
  });

  describe('findPostsWithExplicitBoolean', () => {
    it('should return transformed query directly', () => {
      expect(
        day08BooleanTransformController.findWithExplicitBoolean({
          isPublished: false,
        }),
      ).toEqual({ isPublished: false });
    });
  });
});
