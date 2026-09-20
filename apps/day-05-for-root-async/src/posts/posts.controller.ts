import { Controller, Get } from '@nestjs/common';
import type { PostConfig } from './post-config.interface';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('config')
  getConfig(): PostConfig {
    return this.postsService.getConfig();
  }
}
