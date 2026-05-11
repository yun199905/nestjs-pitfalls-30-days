import { Controller, Get } from '@nestjs/common';
import { Day06CorsService } from './day-06-cors.service';

@Controller()
export class Day06CorsController {
  constructor(private readonly day06CorsService: Day06CorsService) {}

  @Get()
  getHello(): string {
    return this.day06CorsService.getHello();
  }
}
