import { Controller, Get } from '@nestjs/common';
import { Day02ProviderDependencyService } from './day-02-provider-dependency.service';

@Controller()
export class Day02ProviderDependencyController {
  constructor(private readonly day02ProviderDependencyService: Day02ProviderDependencyService) {}

  @Get()
  getHello(): string {
    return this.day02ProviderDependencyService.getHello();
  }
}
