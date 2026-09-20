import { Inject, Injectable } from '@nestjs/common';
import type { PostConfig } from './post-config.interface';
import { POSTS_MODULE_OPTIONS } from './posts.constants';

@Injectable()
export class PostsService {
  constructor(
    @Inject(POSTS_MODULE_OPTIONS)
    private readonly config: PostConfig,
  ) {}

  getConfig(): PostConfig {
    return this.config;
  }
}
