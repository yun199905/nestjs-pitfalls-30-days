import { Controller, Get } from '@nestjs/common';
import { Day28UnhandledPromiseRejectService } from './day-28-unhandled-promise-reject.service';

@Controller()
export class Day28UnhandledPromiseRejectController {
  constructor(private readonly day28UnhandledPromiseRejectService: Day28UnhandledPromiseRejectService) {}

  @Get()
  getHello(): string {
    return this.day28UnhandledPromiseRejectService.getHello();
  }
}
