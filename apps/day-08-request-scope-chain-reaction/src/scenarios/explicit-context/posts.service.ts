import { Injectable } from '@nestjs/common';
import { InstanceTrackerService } from '../../shared/instance-tracker.service';
import { PostsRepository } from '../../shared/posts.repository';
import { ScopeDemoResponse } from '../../shared/posts.types';

@Injectable()
export class PostsService {
  readonly instanceId: string;

  constructor(
    private readonly postsRepository: PostsRepository,
    instanceTracker: InstanceTrackerService,
  ) {
    this.instanceId = instanceTracker.nextId('explicit-posts-service');
  }

  findPost(requestId: string, controllerInstanceId: string): ScopeDemoResponse {
    return {
      requestId,
      strategy: 'explicit-context',
      instances: {
        controller: controllerInstanceId,
        service: this.instanceId,
        requestContext: null,
        repository: this.postsRepository.instanceId,
      },
      post: this.postsRepository.findPost(),
    };
  }
}
