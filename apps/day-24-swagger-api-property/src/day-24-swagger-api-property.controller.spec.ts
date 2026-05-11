import { Test, TestingModule } from '@nestjs/testing';
import { Day24SwaggerApiPropertyController } from './day-24-swagger-api-property.controller';
import { Day24SwaggerApiPropertyService } from './day-24-swagger-api-property.service';

describe('Day24SwaggerApiPropertyController', () => {
  let day24SwaggerApiPropertyController: Day24SwaggerApiPropertyController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day24SwaggerApiPropertyController],
      providers: [Day24SwaggerApiPropertyService],
    }).compile();

    day24SwaggerApiPropertyController = app.get<Day24SwaggerApiPropertyController>(Day24SwaggerApiPropertyController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day24SwaggerApiPropertyController.getHello()).toBe('Hello World!');
    });
  });
});
