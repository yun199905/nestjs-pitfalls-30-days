import { Module } from '@nestjs/common';
import { Day03CircularDependencyController } from './day-03-circular-dependency.controller';
import { Day03CircularDependencyService } from './day-03-circular-dependency.service';

@Module({
  controllers: [Day03CircularDependencyController],
  providers: [Day03CircularDependencyService],
})
export class Day03CircularDependencyModule {}
