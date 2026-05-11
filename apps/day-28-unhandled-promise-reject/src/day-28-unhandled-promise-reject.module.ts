import { Module } from '@nestjs/common';
import { Day28UnhandledPromiseRejectController } from './day-28-unhandled-promise-reject.controller';
import { Day28UnhandledPromiseRejectService } from './day-28-unhandled-promise-reject.service';

@Module({
  imports: [],
  controllers: [Day28UnhandledPromiseRejectController],
  providers: [Day28UnhandledPromiseRejectService],
})
export class Day28UnhandledPromiseRejectModule {}
