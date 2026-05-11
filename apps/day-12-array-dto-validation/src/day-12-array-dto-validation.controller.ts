import { Controller, Get } from '@nestjs/common';
import { Day12ArrayDtoValidationService } from './day-12-array-dto-validation.service';

@Controller()
export class Day12ArrayDtoValidationController {
  constructor(private readonly day12ArrayDtoValidationService: Day12ArrayDtoValidationService) {}

  @Get()
  getHello(): string {
    return this.day12ArrayDtoValidationService.getHello();
  }
}
