import { Controller, Get } from '@nestjs/common';
import { Day10NestedDtoValidationService } from './day-10-nested-dto-validation.service';

@Controller()
export class Day10NestedDtoValidationController {
  constructor(private readonly day10NestedDtoValidationService: Day10NestedDtoValidationService) {}

  @Get()
  getHello(): string {
    return this.day10NestedDtoValidationService.getHello();
  }
}
