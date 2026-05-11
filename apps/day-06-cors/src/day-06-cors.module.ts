import { Module } from '@nestjs/common';
import { Day06CorsController } from './day-06-cors.controller';
import { Day06CorsService } from './day-06-cors.service';

@Module({
  imports: [],
  controllers: [Day06CorsController],
  providers: [Day06CorsService],
})
export class Day06CorsModule {}
