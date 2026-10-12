import { Controller, Get, NotFoundException, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

@Controller('posts')
// 將下一行註解掉，可觀察同一個 NotFoundException 改由 Global Filter 處理
@UseFilters(HttpExceptionFilter)
export class PostsController {
  @Get('missing')
  missing(): never {
    throw new NotFoundException('Post 404 not found');
  }

  @Get('unexpected')
  unexpected(): never {
    throw new Error('Database connection unexpectedly failed');
  }
}
