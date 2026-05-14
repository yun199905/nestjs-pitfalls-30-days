import { Module } from '@nestjs/common';
import { ReqAService } from './req-a.service';
import { ReqBService } from './req-b.service';
import { ReqController } from './req.controller';

@Module({
  controllers: [ReqController],
  providers: [ReqAService, ReqBService],
})
export class RequestScopeModule {}
