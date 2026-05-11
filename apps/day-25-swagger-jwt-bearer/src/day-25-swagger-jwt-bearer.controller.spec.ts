import { Test, TestingModule } from '@nestjs/testing';
import { Day25SwaggerJwtBearerController } from './day-25-swagger-jwt-bearer.controller';
import { Day25SwaggerJwtBearerService } from './day-25-swagger-jwt-bearer.service';

describe('Day25SwaggerJwtBearerController', () => {
  let day25SwaggerJwtBearerController: Day25SwaggerJwtBearerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day25SwaggerJwtBearerController],
      providers: [Day25SwaggerJwtBearerService],
    }).compile();

    day25SwaggerJwtBearerController = app.get<Day25SwaggerJwtBearerController>(Day25SwaggerJwtBearerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day25SwaggerJwtBearerController.getHello()).toBe('Hello World!');
    });
  });
});
