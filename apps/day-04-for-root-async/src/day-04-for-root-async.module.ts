import { Module } from '@nestjs/common';
import { Day04ForRootAsyncController } from './day-04-for-root-async.controller';
import { Day04ForRootAsyncService } from './day-04-for-root-async.service';

@Module({
  imports: [],
  controllers: [Day04ForRootAsyncController],
  providers: [Day04ForRootAsyncService],
})
export class Day04ForRootAsyncModule {}
