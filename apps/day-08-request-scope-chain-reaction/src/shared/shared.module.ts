import { Module } from '@nestjs/common';
import { InstanceTrackerService } from './instance-tracker.service';
import { PostsRepository } from './posts.repository';

@Module({
  providers: [InstanceTrackerService, PostsRepository],
  exports: [InstanceTrackerService, PostsRepository],
})
export class SharedModule {}
