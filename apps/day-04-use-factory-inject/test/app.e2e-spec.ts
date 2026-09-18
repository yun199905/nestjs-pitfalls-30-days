import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Day04UseFactoryInjectModule } from './../src/day-04-use-factory-inject.module';
import type { PostConfig } from './../src/post-config.interface';
import { postConfigSchema } from './../src/post-config.schema';

const CORRECT = {
  apiBaseUrl: 'https://posts.example.test',
  defaultAuthor: 'YUN',
};

const SWAPPED = {
  apiBaseUrl: 'YUN',
  defaultAuthor: 'https://posts.example.test',
};

describe('Day04UseFactoryInjectModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day04UseFactoryInjectModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /posts/config 顯示 inject 順序錯位後的設定', () => {
    return request(app.getHttpServer() as App)
      .get('/posts/config')
      .expect(200)
      .expect(SWAPPED);
  });

  it.each([
    ['解法一 對齊 inject 順序', '/posts/config/aligned'],
    ['解法二 聚合成單一物件', '/posts/config/object'],
    ['解法三 class-based provider', '/posts/config/class'],
    ['解法四 邊界 validation', '/posts/config/validated'],
  ])('%s 回傳正確設定', (_name, path) => {
    return request(app.getHttpServer() as App)
      .get(path)
      .expect(200)
      .expect(CORRECT);
  });

  it('四種解法的輸出完全一致', async () => {
    const paths = [
      '/posts/config/aligned',
      '/posts/config/object',
      '/posts/config/class',
      '/posts/config/validated',
    ];

    const bodies: unknown[] = [];
    for (const path of paths) {
      const response = await request(app.getHttpServer() as App).get(path);
      bodies.push(response.body);
    }

    expect(new Set(bodies.map((body) => JSON.stringify(body))).size).toBe(1);
  });
});

describe('解法四：錯位會在啟動期就失敗 (e2e)', () => {
  // 與 module 裡的 POST_CONFIG_VALIDATED 相同形狀，只有 inject 順序不同。
  const buildModule = (inject: string[], validate: boolean) =>
    Test.createTestingModule({
      providers: [
        { provide: 'POST_API_BASE_URL', useValue: CORRECT.apiBaseUrl },
        { provide: 'DEFAULT_AUTHOR', useValue: CORRECT.defaultAuthor },
        {
          provide: 'POST_CONFIG_VALIDATED',
          inject,
          useFactory: (apiBaseUrl: string, defaultAuthor: string): PostConfig =>
            validate
              ? postConfigSchema.parse({ apiBaseUrl, defaultAuthor })
              : { apiBaseUrl, defaultAuthor },
        },
      ],
    }).compile();

  const ALIGNED = ['POST_API_BASE_URL', 'DEFAULT_AUTHOR'];
  const SWAPPED_INJECT = ['DEFAULT_AUTHOR', 'POST_API_BASE_URL'];

  it('inject 順序正確時可以正常初始化', async () => {
    const moduleRef = await buildModule(ALIGNED, true);
    expect(moduleRef.get<PostConfig>('POST_CONFIG_VALIDATED')).toEqual(CORRECT);
    await moduleRef.close();
  });

  it('把 inject 兩個 token 對調後，provider 無法完成初始化', async () => {
    await expect(buildModule(SWAPPED_INJECT, true)).rejects.toThrow();
  });

  it('對照組：同樣的錯位，沒有驗證時會安靜地通過', async () => {
    const moduleRef = await buildModule(SWAPPED_INJECT, false);
    expect(moduleRef.get<PostConfig>('POST_CONFIG_VALIDATED')).toEqual(SWAPPED);
    await moduleRef.close();
  });
});
