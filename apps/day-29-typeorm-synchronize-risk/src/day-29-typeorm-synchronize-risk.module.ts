import { Module } from '@nestjs/common';
import { Day29TypeormSynchronizeRiskController } from './day-29-typeorm-synchronize-risk.controller';
import { Day29TypeormSynchronizeRiskService } from './day-29-typeorm-synchronize-risk.service';

@Module({
  imports: [],
  controllers: [Day29TypeormSynchronizeRiskController],
  providers: [Day29TypeormSynchronizeRiskService],
})
export class Day29TypeormSynchronizeRiskModule {}
