import { Test, TestingModule } from '@nestjs/testing';
import { Day15OneToManyRelationController } from './day-15-one-to-many-relation.controller';
import { Day15OneToManyRelationService } from './day-15-one-to-many-relation.service';

describe('Day15OneToManyRelationController', () => {
  let day15OneToManyRelationController: Day15OneToManyRelationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day15OneToManyRelationController],
      providers: [Day15OneToManyRelationService],
    }).compile();

    day15OneToManyRelationController = app.get<Day15OneToManyRelationController>(Day15OneToManyRelationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day15OneToManyRelationController.getHello()).toBe('Hello World!');
    });
  });
});
