import { Controller, Get, Headers } from '@nestjs/common';
import { InstanceTrackerService } from '../../shared/instance-tracker.service';
import type { ScopeDemoResponse } from '../../shared/posts.types';
import { PostsService } from './posts.service';

const MISSING_REQUEST_ID = 'request-id-not-provided';

@Controller('posts/explicit-context')
export class PostsController {
  private readonly instanceId: string;

  constructor(
    private readonly postsService: PostsService,
    instanceTracker: InstanceTrackerService,
  ) {
    this.instanceId = instanceTracker.nextId('explicit-posts-controller');
  }

  @Get()
  findPost(@Headers('x-request-id') requestId?: string): ScopeDemoResponse {
    return this.postsService.findPost(
      requestId ?? MISSING_REQUEST_ID,
      this.instanceId,
    );
  }
}
