import { Test, TestingModule } from '@nestjs/testing';
import { Day27DockerDistPermissionController } from './day-27-docker-dist-permission.controller';
import { Day27DockerDistPermissionService } from './day-27-docker-dist-permission.service';

describe('Day27DockerDistPermissionController', () => {
  let day27DockerDistPermissionController: Day27DockerDistPermissionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day27DockerDistPermissionController],
      providers: [Day27DockerDistPermissionService],
    }).compile();

    day27DockerDistPermissionController = app.get<Day27DockerDistPermissionController>(Day27DockerDistPermissionController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day27DockerDistPermissionController.getHello()).toBe('Hello World!');
    });
  });
});
