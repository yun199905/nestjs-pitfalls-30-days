import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { UserProfileResponseDto } from './user-profile-response.dto';
import { User } from './user.entity';

export type UserProfileData = Pick<User, 'id' | 'email' | 'passwordHash'> & {
  postCount: number;
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
    await this.usersRepository.insert([
      {
        id: 1,
        email: 'reader@example.com',
        passwordHash: '$2b$10$demo-password-hash',
      },
      {
        id: 2,
        email: 'another-reader@example.com',
        passwordHash: '$2b$10$another-demo-password-hash',
      },
    ]);

    await this.postsRepository.insert([
      { id: 1, authorId: 1 },
      { id: 2, authorId: 1 },
      { id: 3, authorId: 2 },
    ]);
  }

  async getProfileData(userId: number): Promise<UserProfileData> {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const postCount = await this.postsRepository.countBy({
      authorId: user.id,
    });

    return { ...user, postCount };
  }

  async getProfile(userId: number): Promise<UserProfileResponseDto> {
    const profileData = await this.getProfileData(userId);

    return plainToInstance(UserProfileResponseDto, profileData);
  }
}
