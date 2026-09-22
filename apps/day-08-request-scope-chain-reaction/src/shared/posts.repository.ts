import { Injectable } from '@nestjs/common';
import { InstanceTrackerService } from './instance-tracker.service';
import { Post } from './posts.types';

@Injectable()
export class PostsRepository {
  readonly instanceId: string;

  constructor(instanceTracker: InstanceTrackerService) {
    this.instanceId = instanceTracker.nextId('posts-repository');
  }

  findPost(): Post {
    return {
      id: 1,
      title: 'Scope.REQUEST chain reaction',
    };
  }
}
