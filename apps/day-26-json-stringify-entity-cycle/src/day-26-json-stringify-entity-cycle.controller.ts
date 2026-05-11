import { Controller, Get } from '@nestjs/common';
import { Day26JsonStringifyEntityCycleService } from './day-26-json-stringify-entity-cycle.service';

@Controller()
export class Day26JsonStringifyEntityCycleController {
  constructor(private readonly day26JsonStringifyEntityCycleService: Day26JsonStringifyEntityCycleService) {}

  @Get()
  getHello(): string {
    return this.day26JsonStringifyEntityCycleService.getHello();
  }
}
