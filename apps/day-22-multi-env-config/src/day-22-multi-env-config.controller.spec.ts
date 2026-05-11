import { Test, TestingModule } from '@nestjs/testing';
import { Day22MultiEnvConfigController } from './day-22-multi-env-config.controller';
import { Day22MultiEnvConfigService } from './day-22-multi-env-config.service';

describe('Day22MultiEnvConfigController', () => {
  let day22MultiEnvConfigController: Day22MultiEnvConfigController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day22MultiEnvConfigController],
      providers: [Day22MultiEnvConfigService],
    }).compile();

    day22MultiEnvConfigController = app.get<Day22MultiEnvConfigController>(Day22MultiEnvConfigController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day22MultiEnvConfigController.getHello()).toBe('Hello World!');
    });
  });
});
