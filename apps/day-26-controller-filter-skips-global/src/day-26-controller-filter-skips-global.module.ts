import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpExceptionFilter } from './http-exception.filter';
import { PostsController } from './posts.controller';

@Module({
  controllers: [PostsController],
  providers: [
    HttpExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class Day26ControllerFilterSkipsGlobalModule {}
