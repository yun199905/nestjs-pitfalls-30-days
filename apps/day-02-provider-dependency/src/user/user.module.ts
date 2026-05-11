import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PostModule } from '../post/post.module';

@Module({
  imports: [PostModule], // ❌ 陷阱 3：UserService 注入了 PostService，但未導入 PostModule
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
