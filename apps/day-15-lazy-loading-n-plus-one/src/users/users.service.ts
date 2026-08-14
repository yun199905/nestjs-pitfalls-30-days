import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../posts/post.entity';
import { User } from './user.entity';

type UserWithPosts = {
  id: number;
  name: string;
  posts: { id: number; title: string }[];
};

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

    for (let i = 1; i <= 3; i++) {
      const user = await this.usersRepository.save({ name: `User ${i}` });
      const postsPerUser = 2 + (i % 2);
      const posts = Array.from({ length: postsPerUser }, (_, index) => ({
        title: `User ${i} 的第 ${index + 1} 篇文章`,
        author: user,
      }));
      await this.postsRepository.save(posts);
    }
  }

  // 地雷：手動迴圈逐筆查詢——先查出所有 user，再對每個 user 各查一次 posts，觸發 1 + N 次查詢
  async findAllWithManualLoop(): Promise<UserWithPosts[]> {
    const users = await this.usersRepository.find();

    const result: UserWithPosts[] = [];
    for (const user of users) {
      const posts = await this.postsRepository.find({
        where: { author: { id: user.id } },
      });
      result.push({
        id: user.id,
        name: user.name,
        posts: posts.map((post) => ({ id: post.id, title: post.title })),
      });
    }
    return result;
  }

  // 地雷：存取 lazy relation 屬性——user.posts 是 Promise<Post[]>，迴圈裡每次 await 都是一次即時查詢，
  // 跟手動迴圈造成的效果完全一樣，只是程式碼裡完全沒有出現 postsRepository
  async findAllWithLazyRelation(): Promise<UserWithPosts[]> {
    const users = await this.usersRepository.find();

    const result: UserWithPosts[] = [];
    for (const user of users) {
      const posts = await user.posts;
      result.push({
        id: user.id,
        name: user.name,
        posts: posts.map((post) => ({ id: post.id, title: post.title })),
      });
    }
    return result;
  }

  // 解法：用 relations 先把 posts join 進來（preload），
  // 無論是手動迴圈還是存取 lazy relation 屬性，都不會再多打查詢
  async findAllPreloaded(): Promise<UserWithPosts[]> {
    const users = await this.usersRepository.find({
      relations: {
        posts: true,
      },
    });

    const result: UserWithPosts[] = [];
    for (const user of users) {
      const posts = await user.posts; // 已經被 join 進來，await 不會再多查一次
      result.push({
        id: user.id,
        name: user.name,
        posts: posts.map((post) => ({ id: post.id, title: post.title })),
      });
    }
    return result;
  }

  // 延伸陷阱：忘記 await lazy relation，posts 會是一個沒有被解開的 Promise
  async findAllWithoutAwait(): Promise<
    { id: number; name: string; posts: Promise<Post[]> }[]
  > {
    const users = await this.usersRepository.find();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      posts: user.posts, // 忘了 await，這裡塞進去的是一個 Promise
    }));
  }
}
