import { Controller, Get } from '@nestjs/common';
import { Day29TypeormSynchronizeRiskService } from './day-29-typeorm-synchronize-risk.service';

@Controller()
export class Day29TypeormSynchronizeRiskController {
  constructor(private readonly day29TypeormSynchronizeRiskService: Day29TypeormSynchronizeRiskService) {}

  @Get()
  getHello(): string {
    return this.day29TypeormSynchronizeRiskService.getHello();
  }
}
