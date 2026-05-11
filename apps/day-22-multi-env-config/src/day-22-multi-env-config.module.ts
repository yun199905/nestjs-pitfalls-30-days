import { Module } from '@nestjs/common';
import { Day22MultiEnvConfigController } from './day-22-multi-env-config.controller';
import { Day22MultiEnvConfigService } from './day-22-multi-env-config.service';

@Module({
  imports: [],
  controllers: [Day22MultiEnvConfigController],
  providers: [Day22MultiEnvConfigService],
})
export class Day22MultiEnvConfigModule {}
