import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

const DEMO_POSTS: Array<Pick<Post, 'title' | 'published'>> = [
  { title: 'NestJS 排坑筆記', published: true },
  { title: 'TypeORM QueryBuilder 實戰', published: true },
  { title: '尚未發布的草稿', published: false },
];

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.postsRepository.save(DEMO_POSTS);
  }

  getPublishedPosts() {
    return this.postsRepository
      .createQueryBuilder('post')
      .where('post.published = :published', { published: true })
      .orderBy('post.id', 'ASC');
    // .getMany(); // 實際執行查詢並取得 Post[]。
  }
}
