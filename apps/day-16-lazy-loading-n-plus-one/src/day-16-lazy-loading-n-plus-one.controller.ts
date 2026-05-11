import { Controller, Get } from '@nestjs/common';
import { Day16LazyLoadingNPlusOneService } from './day-16-lazy-loading-n-plus-one.service';

@Controller()
export class Day16LazyLoadingNPlusOneController {
  constructor(private readonly day16LazyLoadingNPlusOneService: Day16LazyLoadingNPlusOneService) {}

  @Get()
  getHello(): string {
    return this.day16LazyLoadingNPlusOneService.getHello();
  }
}
