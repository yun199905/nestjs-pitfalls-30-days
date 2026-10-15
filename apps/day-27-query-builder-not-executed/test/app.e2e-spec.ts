import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Day27QueryBuilderNotExecutedModule } from './../src/day-27-query-builder-not-executed.module';

describe('Day27QueryBuilderNotExecutedModule (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day27QueryBuilderNotExecutedModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    await app.init();
    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
    expect(dataSource.isInitialized).toBe(false);
  });

  it('GET /posts 回傳 QueryBuilder 時得到 500', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/posts')
      .expect(500);

    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });
});
