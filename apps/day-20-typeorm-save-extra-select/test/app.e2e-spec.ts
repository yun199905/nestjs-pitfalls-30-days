import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Day20TypeormSaveExtraSelectModule } from './../src/day-20-typeorm-save-extra-select.module';
import { day20QueryRecorder } from './../src/query-recorder.logger';

describe('Day20TypeormSaveExtraSelectModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day20TypeormSaveExtraSelectModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('provides the seeded Post', async () => {
    await request(app.getHttpServer() as never)
      .get('/posts/1')
      .expect(200)
      .expect({ id: 1, title: '第一篇文章' });
  });

  it('save() selects the existing row before updating it', async () => {
    day20QueryRecorder.startRecording();

    const response = await request(app.getHttpServer() as never)
      .patch('/posts/1/save')
      .send({ title: '使用 save 更新' })
      .expect(200);

    const queries = day20QueryRecorder.stopRecording();

    expect(response.body).toEqual({ id: 1, title: '使用 save 更新' });
    expect(queries.some((query) => query.startsWith('SELECT'))).toBe(true);
    expect(queries.some((query) => query.startsWith('UPDATE'))).toBe(true);
  });

  it('update() sends an UPDATE without a preceding SELECT', async () => {
    day20QueryRecorder.startRecording();

    const response = await request(app.getHttpServer() as never)
      .patch('/posts/1/update')
      .send({ title: '使用 update 更新' })
      .expect(200);

    const queries = day20QueryRecorder.stopRecording();

    expect(response.body).toEqual({
      id: 1,
      title: '使用 update 更新',
      strategy: 'update',
    });
    expect(queries).toHaveLength(1);
    expect(queries[0]).toMatch(/^UPDATE/);
  });

  it('update() returns 404 when no row is affected', async () => {
    await request(app.getHttpServer() as never)
      .patch('/posts/999/update')
      .send({ title: '不存在的文章' })
      .expect(404);
  });

  it('save() inserts an entity when the id does not exist', async () => {
    await request(app.getHttpServer() as never)
      .patch('/posts/999/save')
      .send({ title: 'save 建立的文章' })
      .expect(200)
      .expect({ id: 999, title: 'save 建立的文章' });

    await request(app.getHttpServer() as never)
      .get('/posts/999')
      .expect(200)
      .expect({ id: 999, title: 'save 建立的文章' });
  });
});
