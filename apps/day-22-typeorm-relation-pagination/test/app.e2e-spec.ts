import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Day22TypeormRelationPaginationModule } from './../src/day-22-typeorm-relation-pagination.module';

type PostResponse = {
  id: number;
  title: string;
};

type UserResponse = {
  id: number;
  name: string;
  posts: PostResponse[];
};

type PaginationResponse = {
  data: UserResponse[];
  meta: {
    page: number;
    pageSize: number;
    currentPageCount: number;
    totalCount: number;
  };
};

describe('Day22TypeormRelationPaginationModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day22TypeormRelationPaginationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('reports three seeded users without a derived totalPages field', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/users/take-skip?page=1&pageSize=2')
      .expect(200);

    const body = response.body as PaginationResponse;
    expect(body.meta.totalCount).toBe(3);
    expect(body.meta).not.toHaveProperty('totalPages');
  });

  it('limit/offset page 1 paginates joined rows and truncates User 1 posts', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/users/limit-offset?page=1&pageSize=2')
      .expect(200);

    const body = response.body as PaginationResponse;
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({ id: 1, name: 'User 1' });
    expect(body.data[0].posts).toHaveLength(2);
    expect(body.meta).toEqual({
      page: 1,
      pageSize: 2,
      currentPageCount: 1,
      totalCount: 3,
    });
  });

  it('limit/offset page 2 repeats User 1 across the page boundary', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/users/limit-offset?page=2&pageSize=2')
      .expect(200);

    const body = response.body as PaginationResponse;
    expect(body.data.map((user) => user.id)).toEqual([1, 2]);
    expect(body.data[0].posts).toHaveLength(1);
    expect(body.data[1].posts).toHaveLength(1);
  });

  it('take/skip page 1 returns two users with complete relations', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/users/take-skip?page=1&pageSize=2')
      .expect(200);

    const body = response.body as PaginationResponse;
    expect(body.data.map((user) => user.id)).toEqual([1, 2]);
    expect(body.data.map((user) => user.posts.length)).toEqual([3, 2]);
    expect(body.meta).toEqual({
      page: 1,
      pageSize: 2,
      currentPageCount: 2,
      totalCount: 3,
    });
  });

  it('take/skip page 2 returns the remaining users without duplication', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/users/take-skip?page=2&pageSize=2')
      .expect(200);

    const body = response.body as PaginationResponse;
    expect(body.data.map((user) => user.id)).toEqual([3]);
    expect(body.data.map((user) => user.posts.length)).toEqual([0]);
    expect(body.meta.currentPageCount).toBe(1);
    expect(body.meta.totalCount).toBe(3);
  });

  it('#11744: relation order truncates page 1 and infers total 1 instead of 3', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/users/order-by-relation?page=1&pageSize=2')
      .expect(200);

    const body = response.body as PaginationResponse;
    expect(body.data.map((user) => user.id)).toEqual([2]);
    expect(body.data[0].posts.map((post) => post.id)).toEqual([5, 4]);
    expect(body.meta).toEqual({
      page: 1,
      pageSize: 2,
      currentPageCount: 1,
      totalCount: 1,
    });
  });

  it('relation order page 2 returns User 1 and infers the correct total 3', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/users/order-by-relation?page=2&pageSize=2')
      .expect(200);

    const body = response.body as PaginationResponse;
    expect(body.data.map((user) => user.id)).toEqual([1]);
    expect(body.meta.currentPageCount).toBe(1);
    expect(body.meta.totalCount).toBe(3);
  });

  it('relation order page 3 repeats User 1 before User 3', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/users/order-by-relation?page=3&pageSize=2')
      .expect(200);

    const body = response.body as PaginationResponse;
    expect(body.data.map((user) => user.id)).toEqual([1, 3]);
    expect(body.meta.currentPageCount).toBe(2);
    expect(body.meta.totalCount).toBe(3);
  });

  it('#5127: grouped data finds two Users but count query without GROUP BY reports 3', async () => {
    const response = await request(app.getHttpServer() as never)
      .get('/users/group-by-post-count?page=1&pageSize=2')
      .expect(200);

    const body = response.body as PaginationResponse;
    expect(body.data.map((user) => user.id)).toEqual([1, 2]);
    expect(body.data).toHaveLength(2);
    expect(body.meta.currentPageCount).toBe(2);
    expect(body.meta.totalCount).toBe(3);
  });

  it('distinguishes joined rows from distinct User entities', async () => {
    await request(app.getHttpServer() as never)
      .get('/users/counts')
      .expect(200)
      .expect({
        joinRowCount: 6,
        distinctUserCount: 3,
      });
  });

  it.each([
    '/users/take-skip?page=0&pageSize=2',
    '/users/take-skip?page=1&pageSize=0',
    '/users/take-skip?page=abc&pageSize=2',
    '/users/limit-offset?page=1.5&pageSize=2',
    '/users/order-by-relation?page=0&pageSize=2',
    '/users/group-by-post-count?page=1&pageSize=0',
  ])('rejects invalid pagination query: %s', async (url) => {
    await request(app.getHttpServer() as never)
      .get(url)
      .expect(400);
  });
});
