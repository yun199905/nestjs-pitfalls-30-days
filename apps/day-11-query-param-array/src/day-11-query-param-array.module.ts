import { Module } from '@nestjs/common';
import { Day11QueryParamArrayController } from './day-11-query-param-array.controller';
import { Day11QueryParamArrayService } from './day-11-query-param-array.service';

@Module({
  imports: [],
  controllers: [Day11QueryParamArrayController],
  providers: [Day11QueryParamArrayService],
})
export class Day11QueryParamArrayModule {}
