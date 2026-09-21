import { Module } from '@nestjs/common';
import { ReqAService } from './req-a.service';
import { ReqBService } from './req-b.service';
import { ReqController } from './req.controller';
import { RequestContextService } from './request-context.service';

@Module({
  controllers: [ReqController],
  providers: [RequestContextService, ReqAService, ReqBService],
})
export class RequestScopeModule {}
