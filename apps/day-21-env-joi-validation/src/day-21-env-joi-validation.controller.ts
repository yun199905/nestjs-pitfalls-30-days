import { Controller, Get } from '@nestjs/common';
import { Day21EnvJoiValidationService } from './day-21-env-joi-validation.service';

@Controller()
export class Day21EnvJoiValidationController {
  constructor(private readonly day21EnvJoiValidationService: Day21EnvJoiValidationService) {}

  @Get()
  getHello(): string {
    return this.day21EnvJoiValidationService.getHello();
  }
}
