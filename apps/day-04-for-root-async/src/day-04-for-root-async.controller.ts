import { Controller, Get } from '@nestjs/common';
import { Day04ForRootAsyncService } from './day-04-for-root-async.service';

@Controller()
export class Day04ForRootAsyncController {
  constructor(private readonly day04ForRootAsyncService: Day04ForRootAsyncService) {}

  @Get()
  getHello(): string {
    return this.day04ForRootAsyncService.getHello();
  }
}
