import { Controller, Get } from '@nestjs/common';
import { Day19RequestLifecycleService } from './day-19-request-lifecycle.service';

@Controller()
export class Day19RequestLifecycleController {
  constructor(private readonly day19RequestLifecycleService: Day19RequestLifecycleService) {}

  @Get()
  getHello(): string {
    return this.day19RequestLifecycleService.getHello();
  }
}
