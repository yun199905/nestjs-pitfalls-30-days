import { Module } from '@nestjs/common';
import { Day05DynamicRouteController } from './day-05-dynamic-route.controller';
import { Day05DynamicRouteService } from './day-05-dynamic-route.service';

@Module({
  imports: [],
  controllers: [Day05DynamicRouteController],
  providers: [Day05DynamicRouteService],
})
export class Day05DynamicRouteModule {}
