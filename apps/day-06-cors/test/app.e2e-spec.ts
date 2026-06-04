import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Day06CorsModule } from './../src/day-06-cors.module';

describe('Day06Cors (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpAdapter']>['getInstance'];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day06CorsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({
      origin: ['http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    await app.init();
    server = app.getHttpAdapter().getInstance();
  });

  it('returns the current user profile', () => {
    return request(server)
      .get('/user/me')
      .expect(200)
      .expect({
        id: 'user-1',
        name: 'Cors Demo User',
        role: 'author',
        note: 'Pretend this profile is fetched with a cookie-based session from another origin.',
      });
  });

  it('returns cors headers for credentialed requests from the allowed origin', async () => {
    const response = await request(server)
      .get('/user/me')
      .set('Origin', 'http://localhost:5173')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('responds to preflight requests for POST /post', async () => {
    const response = await request(server)
      .options('/post')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type, Authorization')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
    expect(response.headers['access-control-allow-methods']).toContain('POST');
    expect(response.headers['access-control-allow-headers']).toContain(
      'Content-Type',
    );
  });
});
