import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Day13ValidationTransformModule } from './../src/day-13-validation-transform.module';
import { setupSwagger } from './../src/swagger';

describe('Day13ValidationTransformController (e2e)', () => {
  let app: INestApplication;

  const validPayload = {
    title: '  NestJS Pipes  ',
    viewCount: '12',
  };

  const whitelistPayload = {
    ...validPayload,
    extraNote: 'client-only',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day13ValidationTransformModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const getHttpServer = () =>
    app.getHttpServer() as Parameters<typeof request>[0];

  it('serves Swagger UI at /api', () => {
    return request(getHttpServer())
      .get('/api')
      .expect(200)
      .expect('content-type', /text\/html/)
      .expect((response) => {
        expect(response.text).toContain('Swagger UI');
      });
  });

  it('validates with a temporary DTO but returns the original plain object when transform is off', () => {
    return request(getHttpServer())
      .post('/posts/transform-off')
      .send(validPayload)
      .expect(201)
      .expect({
        isDtoInstance: false,
        hasCreateSlug: false,
        receivedBody: {
          title: '  NestJS Pipes  ',
          viewCount: '12',
        },
      });
  });

  it('returns the transformed DTO instance when transform is on', () => {
    return request(getHttpServer())
      .post('/posts/transform-on')
      .send(validPayload)
      .expect(201)
      .expect({
        isDtoInstance: true,
        hasCreateSlug: true,
        receivedBody: {
          title: 'NestJS Pipes',
          viewCount: 12,
          visibility: 'draft',
        },
      });
  });

  it('returns transformed and whitelisted data without the DTO prototype when transform is off', () => {
    return request(getHttpServer())
      .post('/posts/transform-off-whitelist')
      .send(whitelistPayload)
      .expect(201)
      .expect({
        isDtoInstance: false,
        hasCreateSlug: false,
        receivedBody: {
          title: 'NestJS Pipes',
          viewCount: 12,
          visibility: 'draft',
        },
      });
  });

  it.each([
    '/posts/transform-off',
    '/posts/transform-on',
    '/posts/transform-off-whitelist',
  ])('rejects a non-string title at %s', (path) => {
    return request(getHttpServer())
      .post(path)
      .send({ title: 123, viewCount: '12' })
      .expect(400);
  });

  it.each([
    '/posts/transform-off',
    '/posts/transform-on',
    '/posts/transform-off-whitelist',
  ])('rejects a non-integer viewCount at %s', (path) => {
    return request(getHttpServer())
      .post(path)
      .send({ title: 'NestJS Pipes', viewCount: 'not-a-number' })
      .expect(400);
  });
});
