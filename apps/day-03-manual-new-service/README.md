# Day 03 練習題：手動 `new Service()` 為什麼會讓 NestJS 的 DI 失效？

## 目標

這一題要觀察的不是「`new` 不能用」，而是物件由誰建立。

`@Injectable()` 只代表這個 class 可以交給 Nest container 管理，不代表任何透過 `new` 建立的 instance 都會自動進入 container。只要自行建立 Service，它和它的依賴就會形成另一棵物件圖，Nest 無法替它執行依賴注入、生命週期管理或測試替換。

本練習保留兩個可以直接比較的端點：

- `POST /posts/manual`：Controller 自己建立 `PostsService`。
- `POST /posts/injected`：Controller 使用 Nest 注入的 `PostsService`。

## 1. 啟動練習

```bash
npx nest start day-03-manual-new-service
```

先呼叫手動建立 Service 的端點：

```bash
curl -X POST http://localhost:3000/posts/manual \
  -H 'Content-Type: application/json' \
  -d '{"title":"Manual post"}'
```

回應中的 `initializedByNest` 是 `false`：

```json
{
  "id": "post-1",
  "title": "Manual post",
  "initializedByNest": false
}
```

再呼叫由 Nest 注入的版本：

```bash
curl -X POST http://localhost:3000/posts/injected \
  -H 'Content-Type: application/json' \
  -d '{"title":"Injected post"}'
```

這次 `initializedByNest` 是 `true`：

```json
{
  "id": "post-1",
  "title": "Injected post",
  "initializedByNest": true
}
```

兩邊都從 `post-1` 開始，不是流水號壞掉，而是它們各自持有一個不同的 `PostIdGeneratorService` instance。

## 2. 找出失去 IoC 控制權的位置

問題位於 `PostsController`：

```typescript
private readonly manualPostsService = new PostsService(
  new PostIdGeneratorService(),
);
```

這段程式雖然可以編譯，也能建立文章，卻把整棵依賴關係寫死在 Controller 裡：

```text
PostsController
├── Nest 注入的 PostsService
│   └── Nest 管理的 PostIdGeneratorService
└── 手動 new 的 PostsService
    └── 手動 new 的 PostIdGeneratorService
```

`PostsService` 實作了 `OnModuleInit`。Nest 在 application 初始化時只會對自己管理的 provider 呼叫 `onModuleInit()`，因此練習用 `initializedByNest` 把這項差異顯示出來。

但請不要把問題縮小成「hook 沒有執行」。真正的問題是：手動 instance 不在 container 裡，所有由 container 提供的能力都無法套用。

## 3. 用測試證明 provider override 也失效

執行 e2e 測試：

```bash
npx jest --config apps/day-03-manual-new-service/test/jest-e2e.json --runInBand
```

測試透過 TestingModule 將 `PostIdGeneratorService` 換成固定回傳 `test-post-id` 的替身：

```typescript
.overrideProvider(PostIdGeneratorService)
.useValue({ next: () => 'test-post-id' })
```

結果是：

- `/posts/injected` 會得到 `test-post-id`，因為依賴由 container 提供。
- `/posts/manual` 仍得到 `post-1`，因為 Controller 已自行建立另一個 generator，TestingModule 根本不知道它存在。

這也是手動 `new Service()` 特別難測試的原因：呼叫端同時決定了「使用哪個抽象」與「如何建立實作」，外部無法再替換它。

## 4. 動手修復

請修改 `PostsController`：

1. 刪除 `manualPostsService` 與 `new PostIdGeneratorService()`。
2. 讓 `/posts/manual` 暫時也呼叫 constructor injection 得到的 `postsService`。
3. 調整 override 測試，確認兩個端點都回傳 `test-post-id`。
4. 確認兩個端點的 `initializedByNest` 都是 `true`。

修正的核心不是把 `new` 搬到另一個檔案，而是把建立物件與組裝依賴的責任交還給 Nest container。

## 5. 驗證指令

```bash
npx nest build day-03-manual-new-service
npx jest --runInBand apps/day-03-manual-new-service/src
npx jest --config apps/day-03-manual-new-service/test/jest-e2e.json --runInBand
```

## 6. 兩個進階情境

主坑之外，`src/scenarios/` 底下另外準備了兩個可執行的情境，對應文章排雷指南的情境二與情境三。它們各自是獨立模組，不會影響上面的主坑練習。

### 情境二：依設定選擇實作（custom provider）

`src/scenarios/02-custom-provider/`

`POST_ID_GENERATOR` 是一個 Symbol token，背後有兩個實作：`UuidPostIdGenerator` 與 `SequentialPostIdGenerator`。**兩個實作都登記在 `providers` 裡、都由容器建立**，factory 只負責依 `POST_ID_TYPE` 決定 token 綁到哪一個。

```bash
# 預設 sequential
npx nest start day-03-manual-new-service
curl -X POST localhost:3000/scenarios/custom-provider \
  -H 'Content-Type: application/json' -d '{"title":"A"}'
# → { "id": "post-1", "title": "A", "generator": "sequential" }

# 換成 uuid
POST_ID_TYPE=uuid npx nest start day-03-manual-new-service
curl -X POST localhost:3000/scenarios/custom-provider \
  -H 'Content-Type: application/json' -d '{"title":"A"}'
# → { "id": "<uuid>", "title": "A", "generator": "uuid" }
```

要觀察的是：切換實作時，`CustomProviderPostsService` 一個字都不用改。它只注入 token，不知道也不需要知道拿到的是誰。設定值可從 `.env.example` 複製成 `.env`。

對照主坑——如果這裡改成在 Service 裡 `new UuidPostIdGenerator()`，就等於把「選哪個實作」寫死進呼叫端，設定也就失去意義了。

### 情境三：執行期向容器查找 provider（`ModuleRef`）

`src/scenarios/03-module-ref/`

`PostPublisher` 注入 `ModuleRef`，依 `mode` 取出 `DraftPostPublisher` 或 `PublicPostPublisher`：

```bash
curl -X POST 'localhost:3000/scenarios/module-ref?mode=draft'
# → { "mode": "draft", "initializedByNest": true }

curl -X POST 'localhost:3000/scenarios/module-ref?mode=public'
# → { "mode": "public", "initializedByNest": true }
```

注意 `initializedByNest` 是 `true`。兩個 publisher 都實作了 `OnModuleInit`，而 `ModuleRef.get()` 取回的是**容器管理的那一份**，所以 hook 跑過了——這正好和 `/posts/manual` 的 `false` 形成對照。

`new` 是「我自己造一個」，`ModuleRef.get()` 是「請容器把它管理的那個給我」。控制權仍然在容器手上。

> `ModuleRef` 是特殊情況下的動態查找工具，不是建構子注入的替代品。能在建構子明確宣告的依賴，仍應優先使用建構子注入。

### 情境的自動化測試

```bash
npx jest --config apps/day-03-manual-new-service/test/jest-e2e.json --runInBand
```

`test/scenarios.e2e-spec.ts` 會驗證：兩種 `POST_ID_TYPE` 各自綁到正確的實作、`ModuleRef` 依 mode 取到對應 publisher，以及「容器管理的實例 `initializedByNest` 為 `true`、手動 `new` 的為 `false`」這組對照。

## 延伸提醒

手動建立 provider 也可能繞過 request scope、集中設定與其他 provider override。這些副作用不在本篇展開；Day 08 會再專門處理 request-scoped provider 對依賴樹與效能的影響。

> `@Injectable()` 只是讓 class 有資格被 Nest 管理；真正讓 DI 生效的，是 instance 必須由 Nest container 建立。
