import { Controller, Get } from '@nestjs/common';
import { Day22MultiEnvConfigService } from './day-22-multi-env-config.service';

@Controller()
export class Day22MultiEnvConfigController {
  constructor(private readonly day22MultiEnvConfigService: Day22MultiEnvConfigService) {}

  @Get()
  getHello(): string {
    return this.day22MultiEnvConfigService.getHello();
  }
}
