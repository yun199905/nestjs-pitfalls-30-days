import { Controller, Get } from '@nestjs/common';
import { Day03CircularDependencyService } from './day-03-circular-dependency.service';

@Controller()
export class Day03CircularDependencyController {
  constructor(
    private readonly day03CircularDependencyService: Day03CircularDependencyService,
  ) {}

  @Get()
  getHello(): string {
    return this.day03CircularDependencyService.getHello();
  }
}
