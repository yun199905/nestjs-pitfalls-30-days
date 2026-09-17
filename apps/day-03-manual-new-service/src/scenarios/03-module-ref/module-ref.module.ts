import { Module } from '@nestjs/common';
import { DraftPostPublisher } from './draft-post-publisher.service';
import { ModuleRefController } from './module-ref.controller';
import { PostPublisher } from './post-publisher.service';
import { PublicPostPublisher } from './public-post-publisher.service';

@Module({
  controllers: [ModuleRefController],
  providers: [DraftPostPublisher, PublicPostPublisher, PostPublisher],
})
export class ModuleRefScenarioModule {}
