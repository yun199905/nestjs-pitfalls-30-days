import { Test, TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Day05ForRootAsyncModule } from './../src/day-05-for-root-async.module';
import { RemotePostConfigService } from './../src/remote-config/remote-post-config.service';

describe('Day05ForRootAsyncModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day05ForRootAsyncModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('遠端設定已載入後，端點仍回傳 factory 過早捕捉的 fallback snapshot', async () => {
    const remoteSource = app.get(RemotePostConfigService);
    await remoteSource.load();

    return request(app.getHttpServer() as App)
      .get('/posts/config')
      .expect(200)
      .expect({
        apiBaseUrl: 'http://localhost:3000/fallback',
        defaultAuthor: 'guest',
        source: 'fallback',
      });
  });
});
