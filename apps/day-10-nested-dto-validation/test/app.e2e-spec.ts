import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Day10NestedDtoValidationModule } from './../src/day-10-nested-dto-validation.module';

describe('Day10NestedDtoValidationController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day10NestedDtoValidationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();
  });

  it('silently accepts invalid nested fields when @Type() is missing', () => {
    return request(app.getHttpServer())
      .post('/posts/without-type')
      .send({
        title: 'My first post',
        content: 'Hello NestJS',
        postMeta: {
          seoTitle: '',
          seoDescription: 12345,
        },
      })
      .expect(201)
      .expect({
        title: 'My first post',
        content: 'Hello NestJS',
        postMeta: {
          seoTitle: '',
          seoDescription: 12345,
        },
      });
  });

  it('rejects invalid nested fields when @Type() is present', () => {
    return request(app.getHttpServer())
      .post('/posts/with-type')
      .send({
        title: 'My first post',
        content: 'Hello NestJS',
        postMeta: {
          seoTitle: '',
          seoDescription: 12345,
        },
      })
      .expect(400);
  });

  it('still accepts invalid nested fields when inner DTO properties have no decorators', () => {
    return request(app.getHttpServer())
      .post('/posts/without-field-decorators')
      .send({
        title: 'My first post',
        content: 'Hello NestJS',
        postMeta: {
          seoTitle: '',
          seoDescription: 12345,
        },
      })
      .expect(201)
      .expect({
        title: 'My first post',
        content: 'Hello NestJS',
        postMeta: {
          seoTitle: '',
          seoDescription: 12345,
        },
      });
  });

  it('still rejects invalid outer fields when @Type() is missing', () => {
    return request(app.getHttpServer())
      .post('/posts/without-type')
      .send({
        title: '',
        content: 'Hello NestJS',
        postMeta: {
          seoTitle: 'SEO title',
          seoDescription: 'SEO description',
        },
      })
      .expect(400);
  });

  it('accepts valid nested data when @Type() is present', () => {
    return request(app.getHttpServer())
      .post('/posts/with-type')
      .send({
        title: 'My first post',
        content: 'Hello NestJS',
        postMeta: {
          seoTitle: 'NestJS Validation Tips',
          seoDescription: 'How nested DTO validation works in NestJS',
        },
      })
      .expect(201)
      .expect({
        title: 'My first post',
        content: 'Hello NestJS',
        postMeta: {
          seoTitle: 'NestJS Validation Tips',
          seoDescription: 'How nested DTO validation works in NestJS',
        },
      });
  });
});
