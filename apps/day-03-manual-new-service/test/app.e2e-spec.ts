import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Day03ManualNewServiceModule } from './../src/day-03-manual-new-service.module';
import { PostIdGeneratorService } from './../src/posts/post-id-generator.service';

describe('Day03ManualNewServiceModule (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day03ManualNewServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('manual 與 injected 端點使用不同物件圖，並呈現不同 lifecycle 狀態', async () => {
    await request(app.getHttpServer() as never)
      .post('/posts/manual')
      .send({ title: 'Manual post' })
      .expect(201)
      .expect({
        id: 'post-1',
        title: 'Manual post',
        initializedByNest: false,
      });

    await request(app.getHttpServer() as never)
      .post('/posts/injected')
      .send({ title: 'Injected post' })
      .expect(201)
      .expect({
        id: 'post-1',
        title: 'Injected post',
        initializedByNest: true,
      });
  });

  it('兩棵物件圖各自維護自己的流水編號', async () => {
    await request(app.getHttpServer() as never)
      .post('/posts/manual')
      .send({ title: 'First manual post' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBe('post-1');
      });

    await request(app.getHttpServer() as never)
      .post('/posts/manual')
      .send({ title: 'Second manual post' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBe('post-2');
      });

    await request(app.getHttpServer() as never)
      .post('/posts/injected')
      .send({ title: 'First injected post' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBe('post-1');
      });

    await request(app.getHttpServer() as never)
      .post('/posts/injected')
      .send({ title: 'Second injected post' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBe('post-2');
      });
  });
});

describe('Day03ManualNewServiceModule provider override (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [Day03ManualNewServiceModule],
    })
      .overrideProvider(PostIdGeneratorService)
      .useValue({ next: () => 'test-post-id' })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('override 只會替換 Nest container 管理的依賴', async () => {
    await request(app.getHttpServer() as never)
      .post('/posts/injected')
      .send({ title: 'Injected post' })
      .expect(201)
      .expect({
        id: 'test-post-id',
        title: 'Injected post',
        initializedByNest: true,
      });

    await request(app.getHttpServer() as never)
      .post('/posts/manual')
      .send({ title: 'Manual post' })
      .expect(201)
      .expect({
        id: 'post-1',
        title: 'Manual post',
        initializedByNest: false,
      });
  });
});
