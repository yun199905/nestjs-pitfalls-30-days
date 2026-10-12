import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Day26ControllerFilterSkipsGlobalModule } from './../src/day-26-controller-filter-skips-global.module';

describe('Day26ControllerFilterSkipsGlobal (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day26ControllerFilterSkipsGlobalModule],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Controller Filter 先匹配後不會再執行 Global Filter', async () => {
    await request(app.getHttpServer() as App)
      .get('/posts/missing')
      .expect(404)
      .expect('x-error-filter', 'controller')
      .expect({
        statusCode: 404,
        message: 'Post 404 not found',
      });
  });

  it('局部 Filter 不匹配一般 Error 時仍由 Global Filter 處理', async () => {
    await request(app.getHttpServer() as App)
      .get('/posts/unexpected')
      .expect(500)
      .expect('x-error-filter', 'global')
      .expect({
        statusCode: 500,
        message: 'Internal server error',
      });
  });
});
