import { INestApplication } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { RolesGuard } from '../src/auth/roles.guard';
import { UserRolesService } from '../src/auth/user-roles.service';
import { Day09GlobalEnhancerDiModule } from '../src/day-09-global-enhancer-di.module';

// user 1 只有 user 角色，user 2 同時有 user 與 admin。
const REGULAR_USER_ID = '1';
const ADMIN_USER_ID = '2';

// 三種註冊方式的授權行為必須完全一致，差別只在 RolesGuard 是誰建立的。
const expectSameAuthorizationBehavior = (getServer: () => Server) => {
  it('lets an admin into the guarded route', async () => {
    await request(getServer())
      .get('/admin')
      .set('x-user-id', ADMIN_USER_ID)
      .expect(200)
      .expect('Admin only');
  });

  it('blocks a regular user from the guarded route', async () => {
    await request(getServer())
      .get('/admin')
      .set('x-user-id', REGULAR_USER_ID)
      .expect(403);
  });

  it('leaves routes without @Roles() open', async () => {
    await request(getServer())
      .get('/profile')
      .set('x-user-id', REGULAR_USER_ID)
      .expect(200)
      .expect('Any authenticated user');
  });
};

describe('寫法一：useGlobalGuards(new RolesGuard(...)) —— 由 bootstrap 建立 (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day09GlobalEnhancerDiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // 依賴由我們自己從容器撈出來，再手動塞進 constructor。
    app.useGlobalGuards(
      new RolesGuard(app.get(Reflector), app.get(UserRolesService)),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  expectSameAuthorizationBehavior(() => server);
});

describe('寫法二：useGlobalGuards(app.get(RolesGuard)) —— 由容器建立 (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    // RolesGuard 要能被 app.get() 取得，必須先登記成 provider；
    // UserRolesService 也要在同一個作用域看得見，所以這裡一併宣告。
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day09GlobalEnhancerDiModule],
      providers: [UserRolesService, RolesGuard],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalGuards(app.get(RolesGuard));
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  expectSameAuthorizationBehavior(() => server);
});

describe('寫法三：APP_GUARD + useClass —— 由容器建立 (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day09GlobalEnhancerDiModule],
      providers: [
        UserRolesService,
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  expectSameAuthorizationBehavior(() => server);
});
