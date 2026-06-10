import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Day08BooleanTransformModule } from './../src/day-08-boolean-transform.module';

describe('Day08BooleanTransformController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day08BooleanTransformModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('incorrectly turns "false" into true when implicit conversion is enabled', () => {
    return request(app.getHttpServer())
      .get('/posts/implicit-version?isPublished=false')
      .expect(200)
      .expect({ isPublished: true });
  });

  it('keeps "true" as boolean true in the implicit route', () => {
    return request(app.getHttpServer())
      .get('/posts/implicit-version?isPublished=true')
      .expect(200)
      .expect({ isPublished: true });
  });

  it('still rejects "false" in the manual route before the fix is uncommented', () => {
    return request(app.getHttpServer())
      .get('/posts/manual-version?isPublished=false')
      .expect(400);
  });

  it('still rejects "true" in the manual route before the fix is uncommented', () => {
    return request(app.getHttpServer())
      .get('/posts/manual-version?isPublished=true')
      .expect(400);
  });

  it('rejects ambiguous boolean strings in the manual route', () => {
    return request(app.getHttpServer())
      .get('/posts/manual-version?isPublished=no')
      .expect(400);
  });
});
