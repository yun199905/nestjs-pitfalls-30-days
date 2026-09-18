import { Test, TestingModule } from '@nestjs/testing';
import { Day04UseFactoryInjectModule } from './day-04-use-factory-inject.module';
import type { PostConfig } from './post-config.interface';

describe('Day04UseFactoryInjectModule providers', () => {
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [Day04UseFactoryInjectModule],
    }).compile();
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('會依 inject 索引傳值，導致兩個同型別的依賴靜默錯位', () => {
    expect(moduleFixture.get<PostConfig>('POST_CONFIG')).toEqual({
      apiBaseUrl: 'YUN',
      defaultAuthor: 'https://posts.example.test',
    });
  });
});
