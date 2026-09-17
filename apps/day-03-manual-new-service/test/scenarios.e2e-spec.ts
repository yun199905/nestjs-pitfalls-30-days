import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Day03ManualNewServiceModule } from './../src/day-03-manual-new-service.module';

const createAppWithPostIdType = async (
  postIdType: string,
): Promise<INestApplication> => {
  const moduleFixture = await Test.createTestingModule({
    imports: [Day03ManualNewServiceModule],
  })
    .overrideProvider(ConfigService)
    .useValue({ get: () => postIdType })
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
};

describe('情境二：custom provider 依設定選擇實作 (e2e)', () => {
  let app: INestApplication;

  afterEach(async () => {
    await app?.close();
  });

  it('POST_ID_TYPE=sequential 時，token 綁到 SequentialPostIdGenerator', async () => {
    app = await createAppWithPostIdType('sequential');

    await request(app.getHttpServer() as never)
      .post('/scenarios/custom-provider')
      .send({ title: 'First' })
      .expect(201)
      .expect({ id: 'post-1', title: 'First', generator: 'sequential' });

    await request(app.getHttpServer() as never)
      .post('/scenarios/custom-provider')
      .send({ title: 'Second' })
      .expect(201)
      .expect({ id: 'post-2', title: 'Second', generator: 'sequential' });
  });

  it('POST_ID_TYPE=uuid 時，token 改綁到 UuidPostIdGenerator', async () => {
    app = await createAppWithPostIdType('uuid');

    await request(app.getHttpServer() as never)
      .post('/scenarios/custom-provider')
      .send({ title: 'Uuid post' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.generator).toBe('uuid');
        expect(body.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
      });
  });

  it('使用端只認 token，切換實作不需要改 CustomProviderPostsService', async () => {
    app = await createAppWithPostIdType('uuid');

    await request(app.getHttpServer() as never)
      .post('/scenarios/custom-provider')
      .send({ title: 'Same endpoint' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.title).toBe('Same endpoint');
        expect(body.generator).toBe('uuid');
      });
  });
});

describe('情境三：ModuleRef 在執行期查找 provider (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [Day03ManualNewServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('依 mode 取得對應的 publisher', async () => {
    await request(app.getHttpServer() as never)
      .post('/scenarios/module-ref?mode=draft')
      .expect(201)
      .expect({ mode: 'draft', initializedByNest: true });

    await request(app.getHttpServer() as never)
      .post('/scenarios/module-ref?mode=public')
      .expect(201)
      .expect({ mode: 'public', initializedByNest: true });
  });

  it('ModuleRef.get() 拿到的是容器管理的實例，lifecycle hook 已執行', async () => {
    // 對照主坑：手動 new 出來的 PostsService，initializedByNest 永遠是 false。
    await request(app.getHttpServer() as never)
      .post('/scenarios/module-ref?mode=draft')
      .expect(201)
      .expect(({ body }) => {
        expect(body.initializedByNest).toBe(true);
      });

    await request(app.getHttpServer() as never)
      .post('/posts/manual')
      .send({ title: 'Manual post' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.initializedByNest).toBe(false);
      });
  });
});
