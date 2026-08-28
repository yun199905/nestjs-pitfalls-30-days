import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Post } from './post.entity';

const POST_TITLE = '第一篇文章';
const FAILURE_MESSAGE = '模擬發文後續流程失敗';

@Injectable()
export class PostsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  // 地雷：呼叫 incrementPostCount() 時漏傳 manager，於是它退回預設 Repository，
  // 跑在另一條連線上。Post rollback 後，已經提交的 postCount 仍會留下來。
  async publishBrokenBoundary() {
    const author = await this.usersService.getDemoAuthor();

    await this.dataSource.transaction(async (manager) => {
      await this.usersService.incrementPostCount(author.id);

      await manager.save(Post, {
        title: POST_TITLE,
        author: { id: author.id },
      });

      throw new Error(FAILURE_MESSAGE);
    });
  }

  // 解法一：把 transaction() 提供的 EntityManager 明確傳下去。
  async publishPassManager() {
    const author = await this.usersService.getDemoAuthor();

    await this.dataSource.transaction(async (manager) => {
      await this.usersService.incrementPostCount(author.id, manager);

      await manager.save(Post, {
        title: POST_TITLE,
        author: { id: author.id },
      });

      throw new Error(FAILURE_MESSAGE);
    });
  }

  // 解法二：手動管理 QueryRunner，所有操作都使用它的 manager。
  async publishWithQueryRunner() {
    const author = await this.usersService.getDemoAuthor();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.usersService.incrementPostCount(
        author.id,
        queryRunner.manager,
      );

      await queryRunner.manager.save(Post, {
        title: POST_TITLE,
        author: { id: author.id },
      });

      throw new Error(FAILURE_MESSAGE);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 延伸陷阱：rollback 只回滾交易，不會把 QueryRunner 的連線還給 pool。
  async publishLeakyQueryRunner() {
    const author = await this.usersService.getDemoAuthor();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.usersService.incrementPostCount(
        author.id,
        queryRunner.manager,
      );

      await queryRunner.manager.save(Post, {
        title: POST_TITLE,
        author: { id: author.id },
      });

      throw new Error(FAILURE_MESSAGE);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
    // 地雷：少了 finally { await queryRunner.release(); }
  }

  // 練習用：刪除文章並重建 postCount 為 0 的固定作者。
  async resetDemoData() {
    await this.postsRepository.createQueryBuilder().delete().execute();
    await this.usersService.resetDemoUser();
  }
}
