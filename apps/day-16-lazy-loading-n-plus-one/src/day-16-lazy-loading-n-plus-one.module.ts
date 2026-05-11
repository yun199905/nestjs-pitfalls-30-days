import { Module } from '@nestjs/common';
import { Day16LazyLoadingNPlusOneController } from './day-16-lazy-loading-n-plus-one.controller';
import { Day16LazyLoadingNPlusOneService } from './day-16-lazy-loading-n-plus-one.service';

@Module({
  imports: [],
  controllers: [Day16LazyLoadingNPlusOneController],
  providers: [Day16LazyLoadingNPlusOneService],
})
export class Day16LazyLoadingNPlusOneModule {}
