import { Test, TestingModule } from '@nestjs/testing';
import { Day09WhitelistForbidNonWhitelistedController } from './day-09-whitelist-forbid-non-whitelisted.controller';
import { Day09WhitelistForbidNonWhitelistedService } from './day-09-whitelist-forbid-non-whitelisted.service';

describe('Day09WhitelistForbidNonWhitelistedController', () => {
  let day09WhitelistForbidNonWhitelistedController: Day09WhitelistForbidNonWhitelistedController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day09WhitelistForbidNonWhitelistedController],
      providers: [Day09WhitelistForbidNonWhitelistedService],
    }).compile();

    day09WhitelistForbidNonWhitelistedController = app.get<Day09WhitelistForbidNonWhitelistedController>(Day09WhitelistForbidNonWhitelistedController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day09WhitelistForbidNonWhitelistedController.getHello()).toBe('Hello World!');
    });
  });
});
