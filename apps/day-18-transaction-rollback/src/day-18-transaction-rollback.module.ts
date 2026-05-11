import { Module } from '@nestjs/common';
import { Day18TransactionRollbackController } from './day-18-transaction-rollback.controller';
import { Day18TransactionRollbackService } from './day-18-transaction-rollback.service';

@Module({
  imports: [],
  controllers: [Day18TransactionRollbackController],
  providers: [Day18TransactionRollbackService],
})
export class Day18TransactionRollbackModule {}
