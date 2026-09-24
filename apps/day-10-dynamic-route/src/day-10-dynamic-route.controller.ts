import { Controller, Get } from '@nestjs/common';
import { Day10DynamicRouteService } from './day-10-dynamic-route.service';

@Controller()
export class Day10DynamicRouteController {
  constructor(private readonly day10DynamicRouteService: Day10DynamicRouteService) {}

  @Get()
  getHello(): string {
    return this.day10DynamicRouteService.getHello();
  }
}
