import { Module } from '@nestjs/common';
import { Day12ArrayDtoValidationController } from './day-12-array-dto-validation.controller';
import { Day12ArrayDtoValidationService } from './day-12-array-dto-validation.service';

@Module({
  imports: [],
  controllers: [Day12ArrayDtoValidationController],
  providers: [Day12ArrayDtoValidationService],
})
export class Day12ArrayDtoValidationModule {}
