import { Controller, Get } from '@nestjs/common';
import { Day13TypeormEntitiesService } from './day-13-typeorm-entities.service';

@Controller()
export class Day13TypeormEntitiesController {
  constructor(private readonly day13TypeormEntitiesService: Day13TypeormEntitiesService) {}

  @Get()
  getHello(): string {
    return this.day13TypeormEntitiesService.getHello();
  }
}
