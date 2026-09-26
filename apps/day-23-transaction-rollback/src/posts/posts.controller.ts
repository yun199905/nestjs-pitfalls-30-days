import { Controller, Delete, Post as HttpPost } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({
    summary: '地雷：沒有使用 transaction 提供的 manager',
    description:
      '呼叫 UsersService.incrementPostCount() 時漏傳 manager，它會退回自己注入的 Repository、' +
      '跑在另一條連線上；後續故意拋錯時 Post 會 rollback，postCount 卻會留下來。' +
      '跑完用 GET /users 觀察結果。',
  })
  @HttpPost('broken-boundary')
  publishBrokenBoundary() {
    return this.postsService.publishBrokenBoundary();
  }

  @ApiOperation({
    summary: '解法一：把 EntityManager 傳下去',
    description:
      '將 transaction() 給的 EntityManager 傳進 UsersService，計數與 Post 都會在故意拋錯後 rollback。' +
      'GET /users 的 postCount 會維持 0。',
  })
  @HttpPost('pass-manager')
  publishPassManager() {
    return this.postsService.publishPassManager();
  }

  @ApiOperation({
    summary: '解法二：手動管理 QueryRunner，交易邊界寫在程式碼裡看得見',
    description:
      '自己 connect / startTransaction / commit / rollback，並在 finally 呼叫 release() 把連線還回池子。' +
      '所有資料庫操作都使用 queryRunner.manager，效果與解法一相同。',
  })
  @HttpPost('query-runner')
  publishWithQueryRunner() {
    return this.postsService.publishWithQueryRunner();
  }

  @ApiOperation({
    summary: '延伸陷阱：少了 finally release()，連線借出去沒還會把 pool 耗盡',
    description:
      '跟解法二幾乎一樣，只是拿掉 finally { release() }。連線池上限被刻意設成 2，' +
      '連打三次之後新的請求不會報錯，只會一直卡住等連線。',
  })
  @HttpPost('leaky-query-runner')
  publishLeakyQueryRunner() {
    return this.postsService.publishLeakyQueryRunner();
  }

  @ApiOperation({
    summary: '刪除 Post 並把示範作者 YUN 的 postCount 重設為 0',
  })
  @Delete('demo-data')
  async resetDemoData() {
    await this.postsService.resetDemoData();
    return { reset: true };
  }
}
