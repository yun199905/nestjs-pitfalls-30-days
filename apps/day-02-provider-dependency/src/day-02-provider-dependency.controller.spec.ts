import { Test, TestingModule } from '@nestjs/testing';
import { Day02ProviderDependencyController } from './day-02-provider-dependency.controller';
import { Day02ProviderDependencyService } from './day-02-provider-dependency.service';

describe('Day02ProviderDependencyController', () => {
  let day02ProviderDependencyController: Day02ProviderDependencyController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day02ProviderDependencyController],
      providers: [Day02ProviderDependencyService],
    }).compile();

    day02ProviderDependencyController = app.get<Day02ProviderDependencyController>(Day02ProviderDependencyController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day02ProviderDependencyController.getHello()).toBe('Hello World!');
    });
  });
});
