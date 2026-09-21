import { Controller, Get } from '@nestjs/common';
import { ReqAService } from './req-a.service';
import { RequestContextService } from './request-context.service';

@Controller('request-scope')
export class ReqController {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly aService: ReqAService,
  ) {}

  @Get()
  triggerRequest() {
    return {
      requestContextOnController: this.requestContext !== undefined,
      ...this.aService.doSomething(),
    };
  }
}
