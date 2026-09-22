import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { Day08RequestScopeChainReactionModule } from '../src/day-08-request-scope-chain-reaction.module';

interface DemoBody {
  requestId: string;
  strategy: string;
  instances: {
    controller: string;
    service: string;
    requestContext: string | null;
    repository: string;
  };
}

describe('Day08RequestScopeChainReaction (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day08RequestScopeChainReactionModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('recreates the request-scoped dependency chain for every request', async () => {
    const first = await request(server)
      .get('/posts/request-scope')
      .set('x-request-id', 'request-a')
      .expect(200);
    const second = await request(server)
      .get('/posts/request-scope')
      .set('x-request-id', 'request-b')
      .expect(200);
    const firstBody = first.body as DemoBody;
    const secondBody = second.body as DemoBody;

    expect(firstBody.requestId).toBe('request-a');
    expect(secondBody.requestId).toBe('request-b');
    expect(firstBody.strategy).toBe('request-scope');
    expect(firstBody.instances.controller).not.toBe(
      secondBody.instances.controller,
    );
    expect(firstBody.instances.service).not.toBe(secondBody.instances.service);
    expect(firstBody.instances.requestContext).not.toBe(
      secondBody.instances.requestContext,
    );
    expect(firstBody.instances.repository).toBe(
      secondBody.instances.repository,
    );
  });

  it('keeps the explicit-context dependency chain as singletons', async () => {
    const first = await request(server)
      .get('/posts/explicit-context')
      .set('x-request-id', 'request-c')
      .expect(200);
    const second = await request(server)
      .get('/posts/explicit-context')
      .set('x-request-id', 'request-d')
      .expect(200);
    const firstBody = first.body as DemoBody;
    const secondBody = second.body as DemoBody;

    expect(firstBody.requestId).toBe('request-c');
    expect(secondBody.requestId).toBe('request-d');
    expect(firstBody.strategy).toBe('explicit-context');
    expect(firstBody.instances.controller).toBe(
      secondBody.instances.controller,
    );
    expect(firstBody.instances.service).toBe(secondBody.instances.service);
    expect(firstBody.instances.requestContext).toBeNull();
    expect(secondBody.instances.requestContext).toBeNull();
    expect(firstBody.instances.repository).toBe(
      secondBody.instances.repository,
    );
  });

  it('keeps the downstream repository singleton across both strategies', async () => {
    const requestScopeResponse = await request(server)
      .get('/posts/request-scope')
      .expect(200);
    const explicitContextResponse = await request(server)
      .get('/posts/explicit-context')
      .expect(200);
    const requestScopeBody = requestScopeResponse.body as DemoBody;
    const explicitContextBody = explicitContextResponse.body as DemoBody;

    expect(requestScopeBody.requestId).toBe('request-id-not-provided');
    expect(explicitContextBody.requestId).toBe('request-id-not-provided');
    expect(requestScopeBody.instances.repository).toBe(
      explicitContextBody.instances.repository,
    );
  });
});
