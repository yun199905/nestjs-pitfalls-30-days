import { Module } from '@nestjs/common';
import { RemotePostConfigService } from './remote-post-config.service';

@Module({
  providers: [RemotePostConfigService],
  exports: [RemotePostConfigService],
})
export class RemotePostConfigModule {}
