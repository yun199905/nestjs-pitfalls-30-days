import { Injectable, OnModuleInit } from '@nestjs/common';
import type { PublishResult } from './post-publisher.interface';

@Injectable()
export class PublicPostPublisher implements OnModuleInit {
  private initializedByNest = false;

  onModuleInit(): void {
    this.initializedByNest = true;
  }

  publish(): PublishResult {
    return { mode: 'public', initializedByNest: this.initializedByNest };
  }
}
