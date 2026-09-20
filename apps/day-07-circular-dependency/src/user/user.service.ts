import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PostService } from '../post/post.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => PostService)) // 注意：這裡也要用 forwardRef 包裝，否則會因為 PostService 也依賴 UserService 而導致循環依賴的錯誤。
    private readonly postService: PostService,
  ) {}

  // 增加使用者活躍度
  increaseActivity(userId: string) {
    console.log(`User ${userId} activity increased!`);
  }

  // 刪除帳號時，需要連帶刪除該用戶發佈的所有文章
  deleteAccount(userId: string) {
    console.log(`User ${userId} account deleted!`);
    this.postService.deletePostsByUserId(userId);
  }
}
