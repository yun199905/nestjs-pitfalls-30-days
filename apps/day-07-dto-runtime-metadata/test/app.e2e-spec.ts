import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Day07DtoRuntimeMetadataModule } from './../src/day-07-dto-runtime-metadata.module';

describe('Day07DtoRuntimeMetadataController (e2e)', () => {
  let app: INestApplication;
  const invalidPayload = {
    title: '',
    content: 123,
    authorId: 0,
  };

  const validPayload = {
    title: 'NestJS pitfalls',
    content: 'Runtime metadata matters',
    authorId: 3,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day07DtoRuntimeMetadataModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /posts/with-interface lets invalid payload pass through', () => {
    return request(app.getHttpServer())
      .post('/posts/with-interface')
      .send(invalidPayload)
      .expect(201)
      .expect(invalidPayload);
  });

  it('POST /posts/with-class rejects invalid payload', () => {
    return request(app.getHttpServer())
      .post('/posts/with-class')
      .send(invalidPayload)
      .expect(400);
  });

  it('POST /posts/with-class accepts valid payload', () => {
    return request(app.getHttpServer())
      .post('/posts/with-class')
      .send(validPayload)
      .expect(201)
      .expect(validPayload);
  });
});
