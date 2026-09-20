# Day 05 練習題：`forRootAsync` 到底在 Async 什麼？

## 目標

這一題要觀察的不是「方法名稱有 `Async`，Nest 就會自動等待裡面所有非同步工作」，而是 **async factory 回傳了什麼**。

`PostsModule.forRootAsync()` 會將 `useFactory` 註冊成 options provider。Nest 會等待 factory **回傳的 Promise** 完成，才建立依賴 options 的 `PostsService`。但如果 factory 啟動一個非同步任務後立即回傳，Nest 不會猜到還有一份工作需要等。

練習中的錯誤版會先回傳 fallback 設定。即使遠端設定稍後已載入，`PostsService` 拿到的仍是啟動當下的 snapshot。

## 1. 啟動練習

```bash
npx nest start day-05-for-root-async
```

終端一開始會出現類似順序：

```text
[PostConfigFactory] Start loading remote post config
[RemotePostConfigService] Fetching remote post config
[PostConfigFactory] Return fallback config
[Bootstrap] Application is ready
[RemotePostConfigService] Remote post config loaded
```

遠端設定明明會載入完成，application 卻在它之前就 ready 了。

呼叫端點：

```bash
curl http://localhost:3000/posts/config
```

```json
{
  "apiBaseUrl": "http://localhost:3000/fallback",
  "defaultAuthor": "guest",
  "source": "fallback"
}
```

等到終端出現 `Remote post config loaded` 再呼叫一次，結果仍然相同。這不是 cache 還沒更新，而是 options provider 已經保存了 factory 當時回傳的 fallback 物件。

## 2. 找出過早回傳的位置

問題在 `src/day-05-for-root-async.module.ts`：

```typescript
useFactory: async (source: RemotePostConfigService) => {
  void source.load();
  return source.current();
},
```

`async` 只會讓 factory 的回傳值成為 Promise。這裡真正回傳的是 `source.current()` 的 fallback；`source.load()` 產生的 Promise 被 `void` 明確丟掉了。

範例在這一行局部關閉 `@typescript-eslint/require-await`，是為了刻意保留錯誤現象。正式專案啟用這條規則，可以在 review 之前就提醒「這個 async function 其實沒有等待任何東西」。

對 Nest 而言，概念上等同於：

```typescript
const options = await useFactory(source); // 幾乎立即得到 fallback
```

Nest 只看得到 `useFactory` 回傳的 Promise，看不到已經被丟掉的 `source.load()`。

## 3. 動手修正

請把錯誤 factory 改成：

```typescript
useFactory: async (source: RemotePostConfigService) => {
  await source.load();
  return source.current();
},
```

重新啟動後，順序會變成：

```text
[PostConfigFactory] Start loading remote post config
[RemotePostConfigService] Fetching remote post config
[RemotePostConfigService] Remote post config loaded
[PostConfigFactory] Return remote config
[Bootstrap] Application is ready
```

這次 application 會等設定載入完成才 ready，端點也會回傳：

```json
{
  "apiBaseUrl": "https://posts.example.test",
  "defaultAuthor": "YUN",
  "source": "remote"
}
```

也可以直接 `return source.load()`，因為 `load()` 本身就回傳 `Promise<PostConfig>`。重點是這個 Promise 必須沿著 factory 的回傳值交給 Nest。

## 4. `forRoot` 與 `forRootAsync` 的差別

`forRoot()` 通常接收已經準備好的 options：

```typescript
PostsModule.forRoot({ apiBaseUrl: '...', defaultAuthor: '...' });
```

`forRootAsync()` 的主要價值是把「建立 options」交給 Nest provider system，因此 factory 可以注入其他 provider，並回傳 `PostConfig` 或 `Promise<PostConfig>`：

```typescript
PostsModule.forRootAsync({
  imports: [RemotePostConfigModule],
  inject: [RemotePostConfigService],
  useFactory: (source) => source.load(),
});
```

所以 `forRootAsync` 不代表「整個 module 變成 async」，也不代表每次 request 都會重新載入設定。它描述的是 options provider 的建立方式。

## 5. 測試驗證

```bash
npx nest build day-05-for-root-async
npx jest --runInBand apps/day-05-for-root-async/src
npx jest --config apps/day-05-for-root-async/test/jest-e2e.json --runInBand
```

- provider 測試用一個手動解除的 Promise，證明 Promise 尚未 resolve 時，TestingModule 不會完成 `compile()`。
- e2e 測試鎖定起始陷阱：就算確定 remote loader 已完成，API 仍回傳 fallback snapshot。
- 完成修正後，請將 e2e 期待值同步改成 remote 設定。

## 延伸提醒

如果 factory 回傳的 Promise reject，Nest application 會在 bootstrap 階段失敗，而不會開始接收 request。實務上的 timeout、retry 與 fallback 策略需要明確設計，但不在本題展開。

這一題也不是 `imports` 陣列誰放前面的問題。factory 能否注入 provider 取決於 module scope，這個主題留到 Day 17。

> `forRootAsync` 的等待邊界，就是 options factory 實際回傳的 Promise。
