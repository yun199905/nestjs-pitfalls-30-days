import { Test, TestingModule } from '@nestjs/testing';
import { Day12DtoRuntimeMetadataController } from './day-12-dto-runtime-metadata.controller';

describe('Day12DtoRuntimeMetadataController', () => {
  let day07DtoRuntimeMetadataController: Day12DtoRuntimeMetadataController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day12DtoRuntimeMetadataController],
    }).compile();

    day07DtoRuntimeMetadataController =
      app.get<Day12DtoRuntimeMetadataController>(
        Day12DtoRuntimeMetadataController,
      );
  });

  describe('with-interface', () => {
    it('should return payload directly', () => {
      expect(
        day07DtoRuntimeMetadataController.createWithInterface({
          title: 'Hello',
          content: 'World',
          authorId: 1,
        }),
      ).toEqual({
        title: 'Hello',
        content: 'World',
        authorId: 1,
      });
    });
  });
});
