import { Module } from '@nestjs/common';
import { Day07ValidationPipeBodyController } from './day-07-validation-pipe-body.controller';
import { Day07ValidationPipeBodyService } from './day-07-validation-pipe-body.service';

@Module({
  imports: [],
  controllers: [Day07ValidationPipeBodyController],
  providers: [Day07ValidationPipeBodyService],
})
export class Day07ValidationPipeBodyModule {}
