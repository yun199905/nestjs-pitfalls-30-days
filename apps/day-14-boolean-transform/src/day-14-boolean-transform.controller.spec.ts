import { Test, TestingModule } from '@nestjs/testing';
import { Day14BooleanTransformController } from './day-14-boolean-transform.controller';

describe('Day14BooleanTransformController', () => {
  let day14BooleanTransformController: Day14BooleanTransformController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day14BooleanTransformController],
    }).compile();

    day14BooleanTransformController =
      app.get<Day14BooleanTransformController>(
        Day14BooleanTransformController,
      );
  });

  describe('findPostsWithImplicitBoolean', () => {
    it('should return transformed query directly', () => {
      expect(
        day14BooleanTransformController.findWithImplicitBoolean({
          isPublished: true,
        }),
      ).toEqual({ isPublished: true });
    });
  });

  describe('findPostsWithExplicitBoolean', () => {
    it('should return transformed query directly', () => {
      expect(
        day14BooleanTransformController.findWithExplicitBoolean({
          isPublished: false,
        }),
      ).toEqual({ isPublished: false });
    });
  });
});
