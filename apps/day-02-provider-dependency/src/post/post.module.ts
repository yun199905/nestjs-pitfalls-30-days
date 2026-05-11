import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';

@Module({
  providers: [PostService], // ❌ 陷阱 1：PostController 注入了 PostService，但未加入 providers 中
  controllers: [PostController],
  exports: [PostService], // ❌ 陷阱 2：UserService 注入了 PostService，但 PostModule 未導出 PostService
})
export class PostModule {}
