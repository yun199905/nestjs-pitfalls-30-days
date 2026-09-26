import { Test, TestingModule } from '@nestjs/testing';
import { Day16BooleanTransformController } from './day-16-boolean-transform.controller';

describe('Day16BooleanTransformController', () => {
  let day16BooleanTransformController: Day16BooleanTransformController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day16BooleanTransformController],
    }).compile();

    day16BooleanTransformController =
      app.get<Day16BooleanTransformController>(
        Day16BooleanTransformController,
      );
  });

  describe('findPostsWithImplicitBoolean', () => {
    it('should return transformed query directly', () => {
      expect(
        day16BooleanTransformController.findWithImplicitBoolean({
          isPublished: true,
        }),
      ).toEqual({ isPublished: true });
    });
  });

  describe('findPostsWithExplicitBoolean', () => {
    it('should return transformed query directly', () => {
      expect(
        day16BooleanTransformController.findWithExplicitBoolean({
          isPublished: false,
        }),
      ).toEqual({ isPublished: false });
    });
  });
});
