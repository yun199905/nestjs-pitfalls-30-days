import { Controller, Get } from '@nestjs/common';
import { Day05DynamicRouteService } from './day-05-dynamic-route.service';

@Controller()
export class Day05DynamicRouteController {
  constructor(private readonly day05DynamicRouteService: Day05DynamicRouteService) {}

  @Get()
  getHello(): string {
    return this.day05DynamicRouteService.getHello();
  }
}
