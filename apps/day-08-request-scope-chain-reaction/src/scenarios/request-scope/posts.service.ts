import { Injectable } from '@nestjs/common';
import { InstanceTrackerService } from '../../shared/instance-tracker.service';
import { PostsRepository } from '../../shared/posts.repository';
import { ScopeDemoResponse } from '../../shared/posts.types';
import { RequestContextService } from './request-context.service';

// 沒有明寫 Scope.REQUEST，但依賴 RequestContextService 後會被提升為 request scope。
@Injectable()
export class PostsService {
  readonly instanceId: string;

  constructor(
    private readonly requestContext: RequestContextService,
    private readonly postsRepository: PostsRepository,
    instanceTracker: InstanceTrackerService,
  ) {
    this.instanceId = instanceTracker.nextId('request-scope-posts-service');
  }

  findPost(controllerInstanceId: string): ScopeDemoResponse {
    return {
      requestId: this.requestContext.getRequestId(),
      strategy: 'request-scope',
      instances: {
        controller: controllerInstanceId,
        service: this.instanceId,
        requestContext: this.requestContext.instanceId,
        repository: this.postsRepository.instanceId,
      },
      post: this.postsRepository.findPost(),
    };
  }
}
