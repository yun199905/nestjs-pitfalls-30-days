import { Controller, Get } from '@nestjs/common';
import { ReqAService } from './req-a.service';

@Controller('request-scope')
export class ReqController {
  constructor(private readonly aService: ReqAService) {}

  @Get()
  triggerRequest() {
    return this.aService.doSomething();
  }
}
