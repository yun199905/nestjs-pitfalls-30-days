import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // POST /post — 發表文章，並連帶增加用戶活躍度
  @Post()
  createPost(@Body() body: { userId: string; content: string }) {
    this.postService.createPost(body.userId, body.content);
    return { message: `Post created for user ${body.userId}.` };
  }
}
