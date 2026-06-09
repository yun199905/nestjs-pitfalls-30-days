import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';

interface CreatePostBody {
  title: string;
  content: string;
  authorId: number;
}

@Controller('posts')
export class Day07DtoRuntimeMetadataController {
  @Post('with-interface')
  @UsePipes(new ValidationPipe({ transform: true }))
  createWithInterface(@Body() body: CreatePostBody) {
    return body;
  }

  @Post('with-class')
  @UsePipes(new ValidationPipe({ transform: true }))
  createWithClassDto(@Body() body: CreatePostDto) {
    return body;
  }
}
