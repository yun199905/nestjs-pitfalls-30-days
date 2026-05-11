import { Module } from '@nestjs/common';
import { Day26JsonStringifyEntityCycleController } from './day-26-json-stringify-entity-cycle.controller';
import { Day26JsonStringifyEntityCycleService } from './day-26-json-stringify-entity-cycle.service';

@Module({
  imports: [],
  controllers: [Day26JsonStringifyEntityCycleController],
  providers: [Day26JsonStringifyEntityCycleService],
})
export class Day26JsonStringifyEntityCycleModule {}
