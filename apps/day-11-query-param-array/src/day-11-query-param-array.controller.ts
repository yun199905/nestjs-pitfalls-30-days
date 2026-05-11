import { Controller, Get } from '@nestjs/common';
import { Day11QueryParamArrayService } from './day-11-query-param-array.service';

@Controller()
export class Day11QueryParamArrayController {
  constructor(private readonly day11QueryParamArrayService: Day11QueryParamArrayService) {}

  @Get()
  getHello(): string {
    return this.day11QueryParamArrayService.getHello();
  }
}
