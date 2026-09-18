import { z } from 'zod';

/**
 * 解法四：在邊界做 validation，讓錯位在啟動期就失敗。
 * 兩個欄位的規則刻意不同（URL vs 非空字串），錯位時 apiBaseUrl 會拿到
 * 'YUN'，無法通過 URL 驗證，因此應用程式在建立 provider 時就會拋錯。
 */
export const postConfigSchema = z.object({
  apiBaseUrl: z.url(),
  defaultAuthor: z.string().min(1),
});
