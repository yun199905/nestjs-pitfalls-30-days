import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './user.entity';

export const DEMO_AUTHOR_NAME = 'YUN';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // 這是發文練習已存在的作者，不屬於發文 transaction 要建立的資料。
  async onModuleInit() {
    const author = await this.usersRepository.findOneBy({
      name: DEMO_AUTHOR_NAME,
    });

    if (author) {
      await this.usersRepository.update(author.id, { postCount: 0 });
      return;
    }

    await this.usersRepository.save({ name: DEMO_AUTHOR_NAME, postCount: 0 });
  }

  async incrementPostCount(userId: number, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(User)
      : this.usersRepository;

    await repository.increment({ id: userId }, 'postCount', 1);
  }

  findAll() {
    return this.usersRepository.find({ order: { id: 'ASC' } });
  }

  getDemoAuthor() {
    return this.usersRepository.findOneByOrFail({ name: DEMO_AUTHOR_NAME });
  }

  // 練習重設用：PostsService 會先刪除 Post，才能安全重建固定作者。
  async resetDemoUser() {
    await this.usersRepository.createQueryBuilder().delete().execute();
    await this.usersRepository.save({
      name: DEMO_AUTHOR_NAME,
      postCount: 0,
    });
  }
}
