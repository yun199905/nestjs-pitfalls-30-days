import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  createPost(@Body() body: { userId: string; content: string }) {
    return this.postService.createPost(body.userId, body.content);
  }
}
