import { Test, TestingModule } from '@nestjs/testing';
import { Day07DtoRuntimeMetadataController } from './day-07-dto-runtime-metadata.controller';

describe('Day07DtoRuntimeMetadataController', () => {
  let day07DtoRuntimeMetadataController: Day07DtoRuntimeMetadataController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day07DtoRuntimeMetadataController],
    }).compile();

    day07DtoRuntimeMetadataController =
      app.get<Day07DtoRuntimeMetadataController>(
        Day07DtoRuntimeMetadataController,
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
