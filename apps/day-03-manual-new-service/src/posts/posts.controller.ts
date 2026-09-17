import { Body, Controller, Post } from '@nestjs/common';
import { PostIdGeneratorService } from './post-id-generator.service';
import { PostsService } from './posts.service';
import type { CreatedPost } from './posts.service';

interface CreatePostBody {
  title: string;
}

@Controller('posts')
export class PostsController {
  // 地雷：這棵物件圖不是由 Nest container 建立，因此不受 DI 與 lifecycle 管理。
  private readonly manualPostsService = new PostsService(
    new PostIdGeneratorService(),
  );

  constructor(private readonly postsService: PostsService) {}

  @Post('manual')
  createManually(@Body() body: CreatePostBody): CreatedPost {
    return this.manualPostsService.create(body.title);
  }

  @Post('injected')
  createWithInjection(@Body() body: CreatePostBody): CreatedPost {
    return this.postsService.create(body.title);
  }
}
