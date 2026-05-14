import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UserModule } from '../user/user.module';

@Module({
  // 備註：只加一邊有可能不報錯，但這是隱性地依賴根模組的 import 順序。有人不小心調換 imports: [PostModule, UserModule] 的順序，依然不會炸；但如果有一天另一個模組直接 import UserModule 作為入口，解析路徑就可能改變，潛在風險仍在。兩邊都加是防禦性最強的寫法。
  imports: [forwardRef(() => UserModule)],
  // imports: [UserModule], // 這樣寫會報錯，因為 UserModule 也 import PostModule，形成循環依賴
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
