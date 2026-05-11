import { Controller, Get } from '@nestjs/common';
import { Day18TransactionRollbackService } from './day-18-transaction-rollback.service';

@Controller()
export class Day18TransactionRollbackController {
  constructor(private readonly day18TransactionRollbackService: Day18TransactionRollbackService) {}

  @Get()
  getHello(): string {
    return this.day18TransactionRollbackService.getHello();
  }
}
