import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.postsRepository.insert({ id: 1, title: '第一篇文章' });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    return post;
  }

  saveTitle(id: number, title: string): Promise<Post> {
    return this.postsRepository.save({ id, title });
  }

  async updateTitle(
    id: number,
    title: string,
  ): Promise<{ id: number; title: string; strategy: 'update' }> {
    const result = await this.postsRepository.update(id, { title });

    if (result.affected === 0) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    return { id, title, strategy: 'update' };
  }
}
