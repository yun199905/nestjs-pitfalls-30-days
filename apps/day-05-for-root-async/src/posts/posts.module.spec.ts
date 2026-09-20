import { Test, TestingModule } from '@nestjs/testing';
import type { PostConfig } from './post-config.interface';
import { POSTS_MODULE_OPTIONS } from './posts.constants';
import { PostsModule } from './posts.module';
import { PostsService } from './posts.service';

describe('PostsModule.forRootAsync', () => {
  let moduleFixture: TestingModule | undefined;

  afterEach(async () => {
    await moduleFixture?.close();
  });

  it('factory 回傳的 Promise 完成前不會建立依賴 options 的 provider', async () => {
    const remoteConfig: PostConfig = {
      apiBaseUrl: 'https://posts.example.test',
      defaultAuthor: 'YUN',
      source: 'remote',
    };

    let resolveConfig!: (config: PostConfig) => void;
    const pendingConfig = new Promise<PostConfig>((resolve) => {
      resolveConfig = resolve;
    });

    let markFactoryStarted!: () => void;
    const factoryStarted = new Promise<void>((resolve) => {
      markFactoryStarted = resolve;
    });

    let compileSettled = false;
    const compiling = Test.createTestingModule({
      imports: [
        PostsModule.forRootAsync({
          useFactory: () => {
            markFactoryStarted();
            return pendingConfig;
          },
        }),
      ],
    })
      .compile()
      .then((compiledModule) => {
        compileSettled = true;
        return compiledModule;
      });

    await factoryStarted;
    expect(compileSettled).toBe(false);

    resolveConfig(remoteConfig);
    moduleFixture = await compiling;

    expect(moduleFixture.get<PostConfig>(POSTS_MODULE_OPTIONS)).toEqual(
      remoteConfig,
    );
    expect(moduleFixture.get(PostsService).getConfig()).toEqual(remoteConfig);
  });
});
