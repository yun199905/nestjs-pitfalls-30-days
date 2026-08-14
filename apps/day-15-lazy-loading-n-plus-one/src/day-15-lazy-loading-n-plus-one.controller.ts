import { Controller, Get } from '@nestjs/common';
import { Day15LazyLoadingNPlusOneService } from './day-15-lazy-loading-n-plus-one.service';

@Controller()
export class Day15LazyLoadingNPlusOneController {
  constructor(private readonly day15LazyLoadingNPlusOneService: Day15LazyLoadingNPlusOneService) {}

  @Get()
  getHello(): string {
    return this.day15LazyLoadingNPlusOneService.getHello();
  }
}
