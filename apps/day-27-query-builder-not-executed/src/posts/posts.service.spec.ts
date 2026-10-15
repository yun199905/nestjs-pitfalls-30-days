import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Post } from './post.entity';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  let dataSource: DataSource;
  let service: PostsService;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [Post],
    });
    await dataSource.initialize();

    service = new PostsService(dataSource.getRepository(Post));
    await service.onModuleInit();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('getPublishedPosts 回傳尚未執行的 SelectQueryBuilder', () => {
    const result = service.getPublishedPosts();

    expect(result).toBeInstanceOf(SelectQueryBuilder);
    expect(() => JSON.stringify(result)).toThrow(/circular structure/i);
  });

  it('QueryBuilder 呼叫 getMany() 後回傳 Entity 陣列', async () => {
    await expect(service.getPublishedPosts().getMany()).resolves.toEqual([
      expect.objectContaining({
        id: 1,
        title: 'NestJS 排坑筆記',
        published: true,
      }),
      expect.objectContaining({
        id: 2,
        title: 'TypeORM QueryBuilder 實戰',
        published: true,
      }),
    ]);
  });
});
