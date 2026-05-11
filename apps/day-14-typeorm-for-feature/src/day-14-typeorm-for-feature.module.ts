import { Module } from '@nestjs/common';
import { Day14TypeormForFeatureController } from './day-14-typeorm-for-feature.controller';
import { Day14TypeormForFeatureService } from './day-14-typeorm-for-feature.service';

@Module({
  imports: [],
  controllers: [Day14TypeormForFeatureController],
  providers: [Day14TypeormForFeatureService],
})
export class Day14TypeormForFeatureModule {}
