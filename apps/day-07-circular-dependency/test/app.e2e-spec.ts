import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Day07CircularDependencyModule } from './../src/day-07-circular-dependency.module';

describe('Day07CircularDependencyController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day07CircularDependencyModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET /request-scope 連續兩次請求都能觀察到循環路徑中的不完整依賴', async () => {
    for (let requestCount = 0; requestCount < 2; requestCount += 1) {
      await request(app.getHttpServer())
        .get('/request-scope')
        .expect(200)
        .expect({
          requestContextOnController: true,
          requestContextOnResolvedA: true,
          reqBServiceOnResolvedA: true,
          requestContextOnASeenFromB: false,
        });
    }
  });
});
