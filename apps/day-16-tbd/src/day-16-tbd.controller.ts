import { Controller, Get } from '@nestjs/common';
import { Day16TbdService } from './day-16-tbd.service';

@Controller()
export class Day16TbdController {
  constructor(private readonly day16TbdService: Day16TbdService) {}

  @Get()
  getHello(): string {
    return this.day16TbdService.getHello();
  }
}
