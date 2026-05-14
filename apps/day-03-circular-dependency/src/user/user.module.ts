import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PostModule } from '../post/post.module';

@Module({
  imports: [forwardRef(() => PostModule)],
  // imports: [PostModule], // 這樣寫會報錯，因為 PostModule 也 import UserModule，形成循環依賴
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
