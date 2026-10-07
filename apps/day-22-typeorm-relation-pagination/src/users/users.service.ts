import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../posts/post.entity';
import {
  JoinCountsResponse,
  PaginationResponse,
} from './pagination-response.interface';
import { User } from './user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingUserCount = await this.usersRepository.count();
    if (existingUserCount > 0) {
      return;
    }

    const postCounts = [3, 2, 0];

    for (const [index, postCount] of postCounts.entries()) {
      const userNumber = index + 1;
      const user = await this.usersRepository.save({
        name: `User ${userNumber}`,
      });

      const posts = Array.from({ length: postCount }, (_, postIndex) => ({
        title: `User ${userNumber} 的第 ${postIndex + 1} 篇文章`,
        author: user,
      }));

      if (posts.length > 0) {
        await this.postsRepository.save(posts);
      }
    }
  }

  async findWithLimitOffset(
    page: number,
    pageSize: number,
  ): Promise<PaginationResponse> {
    const offset = (page - 1) * pageSize;

    // 地雷：LIMIT/OFFSET 直接切割 JOIN 展開後的資料列。
    // TypeORM 之後才把相同 user 的資料列合併成 entity，因此可能少人、跨頁重複，
    // 甚至只組合出一部分 posts。
    const [data, totalCount] = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .orderBy('user.id', 'ASC')
      .limit(pageSize)
      .offset(offset)
      .getManyAndCount();

    return this.buildResponse(data, page, pageSize, totalCount);
  }

  async findWithTakeSkip(
    page: number,
    pageSize: number,
  ): Promise<PaginationResponse> {
    const skip = (page - 1) * pageSize;

    // 解法：同樣使用 QueryBuilder，只把 limit/offset 換成 take/skip。
    // 有 JOIN relation 時，TypeORM 會先分頁取得 distinct user id，
    // 再依這批 id 載入完整 entity 與 posts。
    const [data, totalCount] = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .orderBy('user.id', 'ASC')
      .take(pageSize)
      .skip(skip)
      .getManyAndCount();

    return this.buildResponse(data, page, pageSize, totalCount);
  }

  async findOrderedByRelation(
    page: number,
    pageSize: number,
  ): Promise<PaginationResponse> {
    const skip = (page - 1) * pageSize;

    // 延伸陷阱：排序欄位來自一對多 relation。distinct pagination query
    // 必須同時選出 user.id 與 post.id，導致同一位 user 仍可占用多個分頁位置。
    const [data, totalCount] = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .orderBy('post.id', 'DESC')
      .take(pageSize)
      .skip(skip)
      .getManyAndCount();

    return this.buildResponse(data, page, pageSize, totalCount);
  }

  async findGroupedByPostCount(
    page: number,
    pageSize: number,
  ): Promise<PaginationResponse> {
    const skip = (page - 1) * pageSize;

    // 延伸陷阱：資料查詢保留 GROUP BY/HAVING，能正確找出至少有兩篇文章的 users；
    // getManyAndCount() 產生 count query 時卻移除 GROUP BY，total 因而變成 3。
    const [data, totalCount] = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.posts', 'post')
      .addSelect('COUNT(post.id)', 'postCount')
      .groupBy('user.id')
      .having('COUNT(post.id) >= :minimumPostCount', {
        minimumPostCount: 2,
      })
      .take(pageSize)
      .skip(skip)
      .getManyAndCount();

    return this.buildResponse(data, page, pageSize, totalCount);
  }

  async getJoinCounts(): Promise<JoinCountsResponse> {
    const rawCount = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.posts', 'post')
      .select('COUNT(*)', 'count')
      .getRawOne<{ count: number | string }>();

    // getCount() 遇到 JOIN 時會計算 distinct 主 Entity，而不是直接 COUNT(*)。
    const distinctUserCount = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.posts', 'post')
      .getCount();

    return {
      joinRowCount: Number(rawCount?.count ?? 0),
      distinctUserCount,
    };
  }

  private buildResponse(
    data: User[],
    page: number,
    pageSize: number,
    totalCount: number,
  ): PaginationResponse {
    return {
      data,
      meta: {
        page,
        pageSize,
        currentPageCount: data.length,
        totalCount,
      },
    };
  }
}
