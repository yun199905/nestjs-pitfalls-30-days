import { Module } from '@nestjs/common';
import { Day21EnvJoiValidationController } from './day-21-env-joi-validation.controller';
import { Day21EnvJoiValidationService } from './day-21-env-joi-validation.service';

@Module({
  imports: [],
  controllers: [Day21EnvJoiValidationController],
  providers: [Day21EnvJoiValidationService],
})
export class Day21EnvJoiValidationModule {}
