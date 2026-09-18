import { Module } from '@nestjs/common';
import { Day04UseFactoryInjectController } from './day-04-use-factory-inject.controller';
import type { PostConfigSource } from './post-config-source.interface';
import type { PostConfig } from './post-config.interface';
import { postConfigSchema } from './post-config.schema';
import { PostConfigService } from './post-config.service';

@Module({
  controllers: [Day04UseFactoryInjectController],
  providers: [
    // 練習中使用固定值，方便專注觀察 inject 與 factory 參數的順序關係。
    {
      provide: 'POST_API_BASE_URL',
      useValue: 'https://posts.example.test',
    },
    {
      provide: 'DEFAULT_AUTHOR',
      useValue: 'YUN',
    },

    // ── 主坑 ─────────────────────────────────────────────
    {
      provide: 'POST_CONFIG',
      // ❌ 陷阱：Nest 依照 inject 陣列的位置傳值，不會依參數名稱配對。
      inject: ['DEFAULT_AUTHOR', 'POST_API_BASE_URL'],
      useFactory: (apiBaseUrl: string, defaultAuthor: string): PostConfig => ({
        apiBaseUrl,
        defaultAuthor,
      }),
    },

    // ── 解法一：把 inject 對齊 factory 參數 ────────────────
    {
      provide: 'POST_CONFIG_ALIGNED',
      inject: ['POST_API_BASE_URL', 'DEFAULT_AUTHOR'],
      useFactory: (apiBaseUrl: string, defaultAuthor: string): PostConfig => ({
        apiBaseUrl,
        defaultAuthor,
      }),
    },

    // ── 解法二：減少位置依賴，把相關資料聚合成單一物件 ──────
    {
      provide: 'POST_CONFIG_SOURCE',
      useValue: {
        apiBaseUrl: 'https://posts.example.test',
        defaultAuthor: 'YUN',
      } satisfies PostConfigSource,
    },
    {
      provide: 'POST_CONFIG_OBJECT',
      inject: ['POST_CONFIG_SOURCE'],
      useFactory: (source: PostConfigSource): PostConfig => ({
        apiBaseUrl: source.apiBaseUrl,
        defaultAuthor: source.defaultAuthor,
      }),
    },

    // ── 解法三：組裝邏輯變複雜時，改用 class-based provider ─
    PostConfigService,

    // ── 解法四：在邊界做 validation，讓錯誤提早失敗 ──────────
    {
      provide: 'POST_CONFIG_VALIDATED',
      inject: ['POST_API_BASE_URL', 'DEFAULT_AUTHOR'],
      // 測試錯誤：應用會在「啟動時」就失敗，而不是像主坑那樣安靜地回傳錯誤的值。
      // inject: ['DEFAULT_AUTHOR', 'POST_API_BASE_URL'],
      useFactory: (apiBaseUrl: string, defaultAuthor: string): PostConfig =>
        postConfigSchema.parse({
          apiBaseUrl,
          defaultAuthor,
        }),
    },
  ],
})
export class Day04UseFactoryInjectModule {}
