# Day 08 練習題：`Scope.REQUEST` 為什麼會讓整條依賴鏈重新建立？

## 目標

這份練習用兩支功能相同的端點，觀察請求作用域如何沿著依賴鏈向上冒泡，也就是傳播到依賴它的上層元件：

- `GET /posts/request-scope`：透過請求作用域的 `RequestContextService` 取得請求識別碼。
- `GET /posts/explicit-context`：由控制器讀取請求識別碼，再以方法參數傳給服務。

另外附上一支對照端點，用來確認不是所有非預設作用域都會冒泡：

- `GET /posts/transient-scope`：控制器與服務都注入 `Scope.TRANSIENT` 的 `LoggerService`。

回應中的實例識別碼會顯示各元件是第幾次被建立。練習重點不是比較業務結果，而是確認哪些元件會在每次請求重新建立。

兩種做法分別放在獨立的情境模組，共用元件則集中在共享模組：

```text
Day08RequestScopeChainReactionModule
├── RequestScopeScenarioModule
│   └── 請求作用域版本的 Controller、Service、RequestContextService
├── ExplicitContextScenarioModule
│   └── 顯式傳遞版本的 Controller、Service
└── TransientScopeScenarioModule
    └── 暫時作用域對照版本的 Controller、Service、LoggerService

SharedModule
└── InstanceTrackerService、PostsRepository
```

三個情境資料夾各自擁有同名的 `PostsController` 與 `PostsService`，由名稱不同的情境模組分別組裝。元件名稱因此只表達業務責任，不暗示它們採用哪一種作用域。

三個情境模組都明確匯入 `SharedModule`，共用同一個 `InstanceTrackerService`，實例識別碼才能跨情境比較。共享模組沒有設成全域模組，主要用途是讓主線的兩條依賴鏈使用同一個 `PostsRepository`，方便確認作用域不會反向影響下層依賴。

## 1. 啟動練習

```bash
npx nest start day-08-request-scope-chain-reaction
```

## 2. 觀察請求作用域版本

連續呼叫兩次端點，並傳入不同的請求識別碼：

```bash
curl -H 'x-request-id: request-a' \
  http://localhost:3000/posts/request-scope

curl -H 'x-request-id: request-b' \
  http://localhost:3000/posts/request-scope
```

比較兩次回應中的 `instances`：

```json
{
  "controller": "request-scope-posts-controller-1",
  "service": "request-scope-posts-service-1",
  "requestContext": "request-context-1",
  "repository": "posts-repository-1"
}
```

第二次請求時，控制器、服務與請求內容服務的尾號會變成 `2`，資料存取層則維持 `posts-repository-1`。

請從下列依賴關係思考原因：

```text
PostsController（request-scope 情境）
└── PostsService（request-scope 情境）
    ├── RequestContextService（Scope.REQUEST）
    └── PostsRepository（單例）
```

需要確認的重點：

1. `RequestContextService` 為什麼每次請求都會重新建立？
2. 沒有明寫 `Scope.REQUEST` 的服務與控制器，為什麼也會重新建立？
3. `PostsRepository` 為什麼不受影響？

## 3. 找出作用域冒泡的起點

起點位於 `src/scenarios/request-scope/request-context.service.ts`：

```typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
}
```

接著沿著建構子依賴往上檢查：

- `request-scope` 情境的 `PostsService` 依賴 `RequestContextService`。
- 同一個情境的 `PostsController` 依賴自己的 `PostsService`。
- `PostsRepository` 不依賴任何請求作用域的提供者。

這能解釋為什麼前三者位於同一棵請求作用域子樹，資料存取層則仍維持單例。

## 4. 觀察顯式傳遞版本

連續呼叫另一支端點：

```bash
curl -H 'x-request-id: request-c' \
  http://localhost:3000/posts/explicit-context

curl -H 'x-request-id: request-d' \
  http://localhost:3000/posts/explicit-context
```

這次 `requestId` 會分別是 `request-c` 與 `request-d`，但控制器、服務與資料存取層的實例識別碼都維持不變：

```json
{
  "controller": "explicit-posts-controller-1",
  "service": "explicit-posts-service-1",
  "requestContext": null,
  "repository": "posts-repository-1"
}
```

對照 `src/scenarios/explicit-context/posts.controller.ts` 與 `src/scenarios/explicit-context/posts.service.ts`，確認請求識別碼如何從 HTTP 邊界以方法參數傳入服務。

## 5. 觀察暫時作用域版本

這支端點是對照組，用來確認 `Scope.TRANSIENT` 不會造成和 `Scope.REQUEST` 相同的冒泡。連續呼叫兩次：

```bash
curl http://localhost:3000/posts/transient-scope
curl http://localhost:3000/posts/transient-scope
```

兩次回應會完全相同：

```json
{
  "strategy": "transient-scope",
  "instances": {
    "controller": "transient-posts-controller-1",
    "service": "transient-posts-service-1",
    "loggerInController": "logger-2",
    "loggerInService": "logger-1"
  }
}
```

這個情境的依賴關係如下：

```text
PostsController（transient-scope 情境）
└── PostsService（transient-scope 情境）
    └── LoggerService（Scope.TRANSIENT）
```

需要確認的重點：

1. 控制器與服務都依賴了非預設作用域的 provider，為什麼尾號跨請求仍然維持 `1`？
2. `loggerInController` 與 `loggerInService` 為什麼是兩個不同的實例？
3. 這兩個 `LoggerService` 實例，為什麼不會在第二次請求時重新建立？

對照 `src/scenarios/transient-scope/logger.service.ts` 與兩個消費端的建構子：暫時作用域的規則是「每個注入點各自一份」，不是「每次請求一份」。實例在控制器與服務被建立時就固定下來，之後跨請求重複使用，因此上層不會被改寫成請求作用域。

## 6. 缺少請求識別碼時的行為

不帶標頭呼叫兩支端點：

```bash
curl http://localhost:3000/posts/request-scope
curl http://localhost:3000/posts/explicit-context
```

兩者都應回傳：

```json
{
  "requestId": "request-id-not-provided"
}
```

實際回應還會包含 `strategy`、`instances` 與 `post`；上方只列出本步驟需要確認的欄位。

## 7. 測試驗證

```bash
npx nest build day-08-request-scope-chain-reaction
npx jest --runInBand apps/day-08-request-scope-chain-reaction/src
npx jest --config apps/day-08-request-scope-chain-reaction/test/jest-e2e.json --runInBand
```

自動化測試會驗證：

- 請求作用域版本的控制器、服務與請求內容服務，每次請求都會更換實例。
- 顯式傳遞版本的控制器與服務，會跨請求共用同一個實例。
- 資料存取層在兩條依賴鏈與所有請求中都是同一個實例。
- 沒有 `x-request-id` 時，兩支端點都會使用固定的替代值。
