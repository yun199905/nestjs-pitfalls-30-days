import { Controller, Get } from '@nestjs/common';
import { Day07ValidationPipeBodyService } from './day-07-validation-pipe-body.service';

@Controller()
export class Day07ValidationPipeBodyController {
  constructor(private readonly day07ValidationPipeBodyService: Day07ValidationPipeBodyService) {}

  @Get()
  getHello(): string {
    return this.day07ValidationPipeBodyService.getHello();
  }
}
