import { Controller, Get } from '@nestjs/common';
import { Day21LazyLoadingNPlusOneService } from './day-21-lazy-loading-n-plus-one.service';

@Controller()
export class Day21LazyLoadingNPlusOneController {
  constructor(private readonly day21LazyLoadingNPlusOneService: Day21LazyLoadingNPlusOneService) {}

  @Get()
  getHello(): string {
    return this.day21LazyLoadingNPlusOneService.getHello();
  }
}
