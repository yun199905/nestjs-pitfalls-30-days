import { Controller, Get } from '@nestjs/common';
import { Day19TypeormEntitiesService } from './day-19-typeorm-entities.service';

@Controller()
export class Day19TypeormEntitiesController {
  constructor(
    private readonly day19TypeormEntitiesService: Day19TypeormEntitiesService,
  ) {}

  @Get()
  getHello(): string {
    return this.day19TypeormEntitiesService.getHello();
  }
}
