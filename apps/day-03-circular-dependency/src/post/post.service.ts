import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class PostService {
  constructor(
    @Inject(forwardRef(() => UserService)) // 注意：這裡也要用 forwardRef 包裝，否則會因為 UserService 也依賴 PostService 而導致循環依賴的錯誤。
    private readonly userService: UserService,
  ) {}

  // 發表文章時，需同時增加使用者活躍度
  createPost(userId: string, content: string) {
    console.log(`User ${userId} created a post: ${content}`);
    this.userService.increaseActivity(userId);
  }

  // 模擬刪除用戶所有貼文的邏輯
  deletePostsByUserId(userId: string) {
    console.log(`User ${userId} deleted all posts`);
  }
}
