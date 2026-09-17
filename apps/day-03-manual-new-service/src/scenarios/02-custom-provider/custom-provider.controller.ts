import { Body, Controller, Post } from '@nestjs/common';
import { CustomProviderPostsService } from './custom-provider-posts.service';
import type { CustomProviderPost } from './custom-provider-posts.service';

interface CreatePostBody {
  title: string;
}

@Controller('scenarios/custom-provider')
export class CustomProviderController {
  constructor(
    private readonly customProviderPostsService: CustomProviderPostsService,
  ) {}

  @Post()
  create(@Body() body: CreatePostBody): CustomProviderPost {
    return this.customProviderPostsService.create(body.title);
  }
}
