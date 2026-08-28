import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Day18TransactionRollbackModule } from './../src/day-18-transaction-rollback.module';
import { Post } from './../src/posts/post.entity';

interface UserResponse {
  id: number;
  name: string;
  postCount: number;
}

const getUsers = async (app: INestApplication): Promise<UserResponse[]> => {
  const response = await request(app.getHttpServer() as never)
    .get('/users')
    .expect(200);

  return response.body as UserResponse[];
};

// 這支測試需要 Postgres 起著：
//   cd apps/day-18-transaction-rollback && docker compose up -d
describe('Day18TransactionRollbackModule (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day18TransactionRollbackModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await request(app.getHttpServer() as never)
      .delete('/posts/demo-data')
      .expect(200);
  });

  it('地雷：資料庫連線模型會影響錯誤交易邊界的觀察結果', async () => {
    await request(app.getHttpServer() as never)
      .post('/posts/broken-boundary')
      .expect(500);

    const users = await getUsers(app);
    const expectedPostCount = dataSource.options.type === 'sqlite' ? 0 : 1;

    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      name: 'YUN',
      postCount: expectedPostCount,
    });
    expect(await dataSource.getRepository(Post).count()).toBe(0);
  });

  it('解法一：傳入 EntityManager 後，postCount 與 Post 會一起回滾', async () => {
    await request(app.getHttpServer() as never)
      .post('/posts/pass-manager')
      .expect(500);

    const users = await getUsers(app);
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({ name: 'YUN', postCount: 0 });
    expect(await dataSource.getRepository(Post).count()).toBe(0);
  });

  it('解法二：QueryRunner 的 manager 讓計數與 Post 一起回滾', async () => {
    await request(app.getHttpServer() as never)
      .post('/posts/query-runner')
      .expect(500);

    const users = await getUsers(app);
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({ name: 'YUN', postCount: 0 });
    expect(await dataSource.getRepository(Post).count()).toBe(0);
  });
});
