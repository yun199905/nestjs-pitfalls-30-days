import { Controller, Post, Query } from '@nestjs/common';
import type { PublishMode, PublishResult } from './post-publisher.interface';
import { PostPublisher } from './post-publisher.service';

@Controller('scenarios/module-ref')
export class ModuleRefController {
  constructor(private readonly postPublisher: PostPublisher) {}

  @Post()
  publish(@Query('mode') mode: PublishMode = 'draft'): PublishResult {
    return this.postPublisher.publish(mode === 'public' ? 'public' : 'draft');
  }
}
