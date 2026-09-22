import { Controller, Get } from '@nestjs/common';
import { InstanceTrackerService } from '../../shared/instance-tracker.service';
import type { ScopeDemoResponse } from '../../shared/posts.types';
import { PostsService } from './posts.service';

// 沒有明寫 Scope.REQUEST，但依賴的 service 已在 request-scoped 依賴樹中。
@Controller('posts/request-scope')
export class PostsController {
  private readonly instanceId: string;

  constructor(
    private readonly postsService: PostsService,
    instanceTracker: InstanceTrackerService,
  ) {
    this.instanceId = instanceTracker.nextId('request-scope-posts-controller');
  }

  @Get()
  findPost(): ScopeDemoResponse {
    return this.postsService.findPost(this.instanceId);
  }
}
