import { Controller, Get } from '@nestjs/common';
import { InstanceTrackerService } from '../../shared/instance-tracker.service';
import type { TransientScopeDemoResponse } from './transient-scope.types';
import { LoggerService } from './logger.service';
import { PostsService } from './posts.service';

@Controller('posts/transient-scope')
export class PostsController {
  private readonly instanceId: string;

  constructor(
    private readonly postsService: PostsService,
    private readonly logger: LoggerService,
    instanceTracker: InstanceTrackerService,
  ) {
    this.instanceId = instanceTracker.nextId('transient-posts-controller');
    this.logger.setContext('transient-posts-controller');
  }

  @Get()
  findPost(): TransientScopeDemoResponse {
    return this.postsService.findPost(this.instanceId, this.logger.instanceId);
  }
}
