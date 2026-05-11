import { Controller, Get } from '@nestjs/common';
import { Day14TypeormForFeatureService } from './day-14-typeorm-for-feature.service';

@Controller()
export class Day14TypeormForFeatureController {
  constructor(private readonly day14TypeormForFeatureService: Day14TypeormForFeatureService) {}

  @Get()
  getHello(): string {
    return this.day14TypeormForFeatureService.getHello();
  }
}
