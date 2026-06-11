import { Body, Controller, Post } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePostWithoutTypeDto } from './dto/create-post-without-type.dto';

@Controller('posts')
export class PostsController {
  @Post('without-type')
  createPostWithoutType(@Body() body: CreatePostWithoutTypeDto) {
    return body;
  }

  @Post('with-type')
  createPostWithType(@Body() body: CreatePostDto) {
    return body;
  }
}
