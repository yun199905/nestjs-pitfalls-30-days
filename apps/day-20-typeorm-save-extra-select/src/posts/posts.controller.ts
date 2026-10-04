import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UpdatePostTitleDto } from './update-post-title.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id/save')
  saveTitle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostTitleDto,
  ) {
    return this.postsService.saveTitle(id, body.title);
  }

  @Patch(':id/update')
  updateTitle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostTitleDto,
  ) {
    return this.postsService.updateTitle(id, body.title);
  }
}
