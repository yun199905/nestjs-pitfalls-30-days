import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Day24ResponseHandlingModule } from './../src/day-24-response-handling.module';
import { DEMO_POST } from './../src/post';

describe('Day24ResponseHandlingController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day24ResponseHandlingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('standard：由 Nest 寫入 interceptor 轉換後的回應', async () => {
    await request(app.getHttpServer() as App)
      .get('/posts')
      .expect(200)
      .expect('x-envelope-interceptor', 'entered')
      .expect({ data: DEMO_POST });
  });

  it('manual：interceptor 有進場，但 @Res() 已自行送出未包裝的回應', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/posts/manual')
      .expect(200)
      .expect('x-envelope-interceptor', 'entered')
      .expect(DEMO_POST);

    expect(response.body).not.toHaveProperty('data');
  });

  it('passthrough：可設定原生 header，回傳值仍交給 Nest 後處理', async () => {
    await request(app.getHttpServer() as App)
      .get('/posts/passthrough')
      .expect(200)
      .expect('x-envelope-interceptor', 'entered')
      .expect('x-demo-mode', 'passthrough')
      .expect({ data: DEMO_POST });
  });
});
