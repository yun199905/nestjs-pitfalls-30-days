import { Module } from '@nestjs/common';
import { Day13TypeormEntitiesController } from './day-13-typeorm-entities.controller';
import { Day13TypeormEntitiesService } from './day-13-typeorm-entities.service';

@Module({
  imports: [],
  controllers: [Day13TypeormEntitiesController],
  providers: [Day13TypeormEntitiesService],
})
export class Day13TypeormEntitiesModule {}
