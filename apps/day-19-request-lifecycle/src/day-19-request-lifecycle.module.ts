import { Module } from '@nestjs/common';
import { Day19RequestLifecycleController } from './day-19-request-lifecycle.controller';
import { Day19RequestLifecycleService } from './day-19-request-lifecycle.service';

@Module({
  imports: [],
  controllers: [Day19RequestLifecycleController],
  providers: [Day19RequestLifecycleService],
})
export class Day19RequestLifecycleModule {}
