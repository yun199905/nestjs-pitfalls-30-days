import { Controller, Get } from '@nestjs/common';
import { Day20ConfigOutsideDiService } from './day-20-config-outside-di.service';

@Controller()
export class Day20ConfigOutsideDiController {
  constructor(private readonly day20ConfigOutsideDiService: Day20ConfigOutsideDiService) {}

  @Get()
  getHello(): string {
    return this.day20ConfigOutsideDiService.getHello();
  }
}
