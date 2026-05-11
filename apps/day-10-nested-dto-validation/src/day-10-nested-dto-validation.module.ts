import { Module } from '@nestjs/common';
import { Day10NestedDtoValidationController } from './day-10-nested-dto-validation.controller';
import { Day10NestedDtoValidationService } from './day-10-nested-dto-validation.service';

@Module({
  imports: [],
  controllers: [Day10NestedDtoValidationController],
  providers: [Day10NestedDtoValidationService],
})
export class Day10NestedDtoValidationModule {}
