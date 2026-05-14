import { Module } from '@nestjs/common';
import { InitAService } from './init-a.service';
import { InitBService } from './init-b.service';

@Module({
  providers: [InitAService, InitBService],
})
export class InitOrderModule {}
