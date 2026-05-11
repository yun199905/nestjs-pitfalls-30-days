import { Test, TestingModule } from '@nestjs/testing';
import { Day18TransactionRollbackController } from './day-18-transaction-rollback.controller';
import { Day18TransactionRollbackService } from './day-18-transaction-rollback.service';

describe('Day18TransactionRollbackController', () => {
  let day18TransactionRollbackController: Day18TransactionRollbackController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Day18TransactionRollbackController],
      providers: [Day18TransactionRollbackService],
    }).compile();

    day18TransactionRollbackController = app.get<Day18TransactionRollbackController>(Day18TransactionRollbackController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(day18TransactionRollbackController.getHello()).toBe('Hello World!');
    });
  });
});
