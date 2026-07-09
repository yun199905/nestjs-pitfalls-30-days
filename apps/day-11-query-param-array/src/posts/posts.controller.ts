import {
  Controller,
  Get,
  ParseArrayPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PostsArrayValidationDto } from './dto/posts-array-validation.dto';
import { PostsQueryDto } from './dto/posts-query.dto';

@Controller('posts')
export class PostsController {
  @Get('raw')
  getTagsAsReceived(@Query('tags') tags: string[]) {
    return this.describeTags(tags);
  }

  @Get('dto-version')
  getTagsFromDto(
    @Query(new ValidationPipe({ transform: true })) query: PostsQueryDto,
  ) {
    return this.describeTags(query.tags);
  }

  @Get('dto-array-validation')
  getTagsWithArrayValidation(
    @Query(new ValidationPipe({ transform: true }))
    query: PostsArrayValidationDto,
  ) {
    return this.describeTags(query.tags);
  }

  @Get('parse-array-version')
  getTagsWithArrayParsing(
    @Query('tags', new ParseArrayPipe({ items: String, separator: ',' }))
    tags: string[],
  ) {
    return this.describeTags(tags);
  }

  private describeTags(tags: string[]) {
    return {
      tags,
      runtimeType: Array.isArray(tags) ? 'array' : typeof tags,
      isArray: Array.isArray(tags),
    };
  }
}
