import { Logger, Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { RemotePostConfigModule } from './remote-config/remote-post-config.module';
import { RemotePostConfigService } from './remote-config/remote-post-config.service';

const factoryLogger = new Logger('PostConfigFactory');

@Module({
  imports: [
    PostsModule.forRootAsync({
      imports: [RemotePostConfigModule],
      inject: [RemotePostConfigService],
      // 這個 lint 例外是練習的一部分：錯誤版刻意有 async 卻沒有 await。
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (source: RemotePostConfigService) => {
        factoryLogger.log('Start loading remote post config');

        // ❌ 陷阱：forRootAsync 只會等待 factory 回傳的 Promise。
        // load() 的 Promise 被丟掉後，factory 會立即回傳目前的 fallback snapshot。
        void source.load();
        const config = source.current();

        factoryLogger.log(`Return ${config.source} config`);
        return config;

        // ✅ 修正：等待載入完成，再取得最新的 snapshot。
        // await source.load();
        // return source.current();
      },
    }),
  ],
})
export class Day05ForRootAsyncModule {}
