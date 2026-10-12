import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { Day25ExcludePlainObjectModule } from './day-25-exclude-plain-object.module';
import { Post } from './post.entity';
import { UserProfileResponseDto } from './user-profile-response.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UserProfileResponseDto serialization', () => {
  let moduleRef: TestingModule;
  let usersService: UsersService;
  let usersRepository: Repository<User>;
  let postsRepository: Repository<Post>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [Day25ExcludePlainObjectModule],
    }).compile();
    await moduleRef.init();

    usersService = moduleRef.get(UsersService);
    usersRepository = moduleRef.get(getRepositoryToken(User));
    postsRepository = moduleRef.get(getRepositoryToken(Post));
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('onModuleInit() 會將示範資料寫入 SQLite', async () => {
    await expect(usersRepository.count()).resolves.toBe(2);
    await expect(postsRepository.count()).resolves.toBe(3);
  });

  it('Repository 會查出指定使用者並只計算他的文章', async () => {
    await expect(usersService.getProfileData(1)).resolves.toEqual({
      id: 1,
      email: 'reader@example.com',
      passwordHash: '$2b$10$demo-password-hash',
      postCount: 2,
    });
  });

  it('會使用傳入的 user id 查詢另一位使用者', async () => {
    await expect(usersService.getProfileData(2)).resolves.toEqual({
      id: 2,
      email: 'another-reader@example.com',
      passwordHash: '$2b$10$another-demo-password-hash',
      postCount: 1,
    });
  });

  it('符合 DTO shape 的 Profile 仍是 plain object，敏感欄位會外洩', async () => {
    const profile: UserProfileResponseDto =
      await usersService.getProfileData(1);

    expect(profile).not.toBeInstanceOf(UserProfileResponseDto);
    expect(instanceToPlain(profile)).toEqual({
      id: 1,
      email: 'reader@example.com',
      passwordHash: '$2b$10$demo-password-hash',
      postCount: 2,
    });
  });

  it('Service 建立 DTO 實例後會套用 @Exclude()', async () => {
    const profile = await usersService.getProfile(1);

    expect(profile).toBeInstanceOf(UserProfileResponseDto);
    expect(profile.passwordHash).toBe('$2b$10$demo-password-hash');
    expect(instanceToPlain(profile)).toEqual({
      id: 1,
      email: 'reader@example.com',
      postCount: 2,
    });
  });
});
