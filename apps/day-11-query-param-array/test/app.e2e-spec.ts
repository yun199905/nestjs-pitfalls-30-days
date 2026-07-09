import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Day11QueryParamArrayModule } from './../src/day-11-query-param-array.module';

describe('Day11QueryParamArrayController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day11QueryParamArrayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('keeps a single query value as a string in the raw version', () => {
    return request(app.getHttpServer())
      .get('/posts/raw?tags=nest')
      .expect(200)
      .expect({
        tags: 'nest',
        runtimeType: 'string',
        isArray: false,
      });
  });

  it('does not split comma-separated query values in the raw version', () => {
    return request(app.getHttpServer())
      .get('/posts/raw?tags=nest,typescript')
      .expect(200)
      .expect({
        tags: 'nest,typescript',
        runtimeType: 'string',
        isArray: false,
      });
  });

  it('receives repeated query keys as an array in the raw version', () => {
    return request(app.getHttpServer())
      .get('/posts/raw?tags=nest&tags=typescript')
      .expect(200)
      .expect({
        tags: ['nest', 'typescript'],
        runtimeType: 'array',
        isArray: true,
      });
  });

  it('does not turn comma-separated values into an array just because the DTO says string[]', () => {
    return request(app.getHttpServer())
      .get('/posts/dto-version?tags=nest,typescript')
      .expect(200)
      .expect({
        tags: 'nest,typescript',
        runtimeType: 'string',
        isArray: false,
      });
  });

  it('keeps a single query value as a string even when the DTO says string[]', () => {
    return request(app.getHttpServer())
      .get('/posts/dto-version?tags=nest')
      .expect(200)
      .expect({
        tags: 'nest',
        runtimeType: 'string',
        isArray: false,
      });
  });

  it('rejects a single query value when the DTO requires an array', () => {
    return request(app.getHttpServer())
      .get('/posts/dto-array-validation?tags=nest')
      .expect(400)
      .expect({
        message: ['tags must be an array'],
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it('rejects a comma-separated string when the DTO requires an array', () => {
    return request(app.getHttpServer())
      .get('/posts/dto-array-validation?tags=nest,typescript')
      .expect(400)
      .expect({
        message: ['tags must be an array'],
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it('accepts repeated query keys when the DTO requires an array', () => {
    return request(app.getHttpServer())
      .get('/posts/dto-array-validation?tags=nest&tags=typescript')
      .expect(200)
      .expect({
        tags: ['nest', 'typescript'],
        runtimeType: 'array',
        isArray: true,
      });
  });

  it('parses comma-separated values into an array with ParseArrayPipe', () => {
    return request(app.getHttpServer())
      .get('/posts/parse-array-version?tags=nest,typescript')
      .expect(200)
      .expect({
        tags: ['nest', 'typescript'],
        runtimeType: 'array',
        isArray: true,
      });
  });

  it('still accepts a single value with ParseArrayPipe', () => {
    return request(app.getHttpServer())
      .get('/posts/parse-array-version?tags=nest')
      .expect(200)
      .expect({
        tags: ['nest'],
        runtimeType: 'array',
        isArray: true,
      });
  });

  it('rejects missing tags in the ParseArrayPipe version', () => {
    return request(app.getHttpServer())
      .get('/posts/parse-array-version')
      .expect(400);
  });

  it('keeps bracket syntax outside the agreed API contract in the raw version', () => {
    return request(app.getHttpServer())
      .get('/posts/raw?tags[]=nest&tags[]=typescript')
      .expect(200)
      .expect({
        runtimeType: 'undefined',
        isArray: false,
      });
  });
});
