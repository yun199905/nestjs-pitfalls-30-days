import { Module } from '@nestjs/common';
import { Day13ValidationTransformController } from './day-13-validation-transform.controller';

@Module({
  controllers: [Day13ValidationTransformController],
})
export class Day13ValidationTransformModule {}
