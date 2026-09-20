import { Controller, Get } from '@nestjs/common';
import { Day07CircularDependencyService } from './day-07-circular-dependency.service';

@Controller()
export class Day07CircularDependencyController {
  constructor(
    private readonly day07CircularDependencyService: Day07CircularDependencyService,
  ) {}

  @Get()
  getHello(): string {
    return this.day07CircularDependencyService.getHello();
  }
}
