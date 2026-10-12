import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Day25ExcludePlainObjectModule } from './../src/day-25-exclude-plain-object.module';

describe('Day25ExcludePlainObjectController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day25ExcludePlainObjectModule],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('broken profile：組裝結果是 plain object，會洩漏 passwordHash', async () => {
    await request(app.getHttpServer() as App)
      .get('/users/1/profile/broken')
      .expect(200)
      .expect({
        id: 1,
        email: 'reader@example.com',
        passwordHash: '$2b$10$demo-password-hash',
        postCount: 2,
      });
  });

  it('fixed profile：回傳 DTO instance，保留 postCount 並排除 passwordHash', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/users/1/profile/fixed')
      .expect(200)
      .expect({ id: 1, email: 'reader@example.com', postCount: 2 });

    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('會使用 route parameter 查詢指定使用者', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/users/2/profile/fixed')
      .expect(200)
      .expect({
        id: 2,
        email: 'another-reader@example.com',
        postCount: 1,
      });

    expect(response.body).not.toHaveProperty('passwordHash');
  });
});
