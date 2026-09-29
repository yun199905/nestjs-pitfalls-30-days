import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'node:http';
import request from 'supertest';
import { Day15IsOptionalModule } from './../src/day-15-is-optional.module';

describe('Day 15 @IsOptional() (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day15IsOptionalModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH /posts/:id/is-optional', () => {
    it('accepts an omitted title', () => {
      return request(httpServer)
        .patch('/posts/42/is-optional')
        .send({})
        .expect(200)
        .expect({ id: '42' });
    });

    it('unexpectedly accepts null because @IsOptional() skips the other validators', () => {
      return request(httpServer)
        .patch('/posts/42/is-optional')
        .send({ title: null })
        .expect(200)
        .expect({ id: '42', title: null });
    });

    it.each([
      ['an empty string', ''],
      ['a non-string value', 123],
    ])('rejects %s', (_case, title) => {
      return request(httpServer)
        .patch('/posts/42/is-optional')
        .send({ title })
        .expect(400);
    });

    it('accepts a non-empty string and preserves the path id', () => {
      return request(httpServer)
        .patch('/posts/42/is-optional')
        .send({ title: 'NestJS Validation' })
        .expect(200)
        .expect({ id: '42', title: 'NestJS Validation' });
    });
  });

  describe('PATCH /posts/:id/validate-if', () => {
    it('accepts an omitted title', () => {
      return request(httpServer)
        .patch('/posts/42/validate-if')
        .send({})
        .expect(200)
        .expect({ id: '42' });
    });

    it.each([
      ['null', null],
      ['an empty string', ''],
      ['a non-string value', 123],
    ])('rejects %s when title is present', (_case, title) => {
      return request(httpServer)
        .patch('/posts/42/validate-if')
        .send({ title })
        .expect(400);
    });

    it('accepts a non-empty string and preserves the path id', () => {
      return request(httpServer)
        .patch('/posts/42/validate-if')
        .send({ title: 'NestJS Validation' })
        .expect(200)
        .expect({ id: '42', title: 'NestJS Validation' });
    });
  });
});
