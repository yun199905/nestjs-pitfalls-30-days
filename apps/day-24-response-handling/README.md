# Day 24 練習題：Controller 一用了 `@Res()`，NestJS 的後處理機制去哪了？

## 1. 題目背景

專案有一個全域 `EnvelopeInterceptor`，負責把每支 API 的回傳值統一包成：

```json
{
  "data": {
    "id": 24,
    "title": "第一篇文章"
  }
}
```

一般 Controller 只要 `return post`，client 就會收到這個 envelope。某支端點為了直接操作 Express response，在參數加入 `@Res()` 並呼叫 `res.json(post)`，結果 response 突然變回未包裝的文章物件。

奇怪的是，response 上仍有 interceptor 加入的診斷 header：

```text
x-envelope-interceptor: entered
```

所以問題不能簡化成「用了 `@Res()`，interceptor 就完全不執行」。這一題要釐清的是：

> `@Res()` 讓 Nest 將這支 route 視為已自行處理 response。Interceptor 仍可進場，但 Nest 不再把 interceptor 轉換後的回傳值寫入 HTTP response。

本題只使用一個固定的 Post，不需要資料庫、DTO 或 Swagger，避免其他機制干擾觀察。

## 2. 啟動練習

```bash
npx nest start day-24-response-handling
```

另開終端機，依序請求三支端點：

```bash
curl -i http://localhost:3000/posts
curl -i http://localhost:3000/posts/manual
curl -i http://localhost:3000/posts/passthrough
```

也可以直接執行 e2e：

```bash
npx jest --config apps/day-24-response-handling/test/jest-e2e.json --runInBand
```

## 3. 全域 response interceptor

`EnvelopeInterceptor` 做兩件事：

1. 在 response 寫入 `x-envelope-interceptor: entered`，作為「interceptor 有進場」的觀察點。
2. 用 RxJS `map()` 將 handler 的回傳值轉成 `{ data: value }`。

```typescript
@Injectable()
export class EnvelopeInterceptor<T> implements NestInterceptor<
  T,
  ResponseEnvelope<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseEnvelope<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    response.setHeader('x-envelope-interceptor', 'entered');

    return next.handle().pipe(map((data) => ({ data })));
  }
}
```

它透過 `APP_INTERCEPTOR` 註冊成全域 interceptor，因此三支端點都會經過它。

## 4. 三種 response handling 模式

### A. 標準模式：`GET /posts`

```typescript
@Get()
getPost(): Post {
  return DEMO_POST;
}
```

Controller 回傳 Post，interceptor 將它轉換成 envelope，最後由 Nest 寫入 response：

```json
{
  "data": {
    "id": 24,
    "title": "第一篇文章"
  }
}
```

### B. 問題版本：`GET /posts/manual`

```typescript
@Get('manual')
getPostWithExpressResponse(@Res() response: Response): Post {
  response.json(DEMO_POST);
  return DEMO_POST;
}
```

實際 body 是未包裝的 Post：

```json
{
  "id": 24,
  "title": "第一篇文章"
}
```

請同時觀察 response header。`x-envelope-interceptor: entered` 仍存在，證明 interceptor 並沒有從執行鏈消失。

Handler 也確實回傳了 `DEMO_POST`，`map()` 可以產生 envelope；但 `res.json()` 已先把原始物件送出，而且 `@Res()` 告訴 Nest 這支 route 採用 library-specific response strategy。Nest 因此不會再次套用轉換結果。

### C. Passthrough：`GET /posts/passthrough`

```typescript
@Get('passthrough')
getPostWithPassthrough(@Res({ passthrough: true }) response: Response): Post {
  response.setHeader('x-demo-mode', 'passthrough');
  return DEMO_POST;
}
```

這個版本只借用原生 response 設定 header，不自行呼叫 `json()`、`send()` 或 `end()`。Post 仍透過 `return` 交給 Nest，所以 client 同時收到：

```text
x-demo-mode: passthrough
```

```json
{
  "data": {
    "id": 24,
    "title": "第一篇文章"
  }
}
```

## 5. 給讀者的任務

1. 比較三支端點的 body 與 headers，確認問題只發生在 manual route 的 response body。
2. 說明為什麼診斷 header 存在，卻沒有 `{ data: ... }` envelope。
3. 找出 Nest 判斷一支 route 是否已自行處理 response 的兩個條件。
4. 將需求分成「只要回傳資料」、「需要設定 header/cookie」與「必須完全操作原生 response」，分別選出適合的寫法。
5. 說明如果使用 `@Res()` 卻沒有呼叫 `json()`、`send()` 或 `end()`，請求為什麼會一直等待。

## 6. 提示

### 提示一

不要只問 interceptor 有沒有被呼叫。把流程拆成兩題：

- interceptor 有沒有進場並取得 handler 的回傳值？
- interceptor 產生的新值最後由誰寫進 HTTP response？

### 提示二

Nest 看到 `@Res()` 或 `@Next()` 時，會把 route 標記成自行處理 response；`passthrough: true` 會改變這個判斷。

### 提示三

`@Res({ passthrough: true })` 的重點不是「讓 `res.json()` 也能搭配 Nest 回傳」，而是只借用原生 response 做局部操作，真正的 body 仍用 `return` 交給 Nest。

## 7. 根因與解法

Nest 的 route 執行流程可以簡化成：

```text
guards / pipes
      ↓
interceptors → controller handler → interceptors 的後段轉換
      ↓
Nest 是否仍負責寫入 response？
      ├─ 是：把最終回傳值 reply 給 client
      └─ 否：略過 reply，等待原生 response 已由程式自行處理
```

當參數有 `@Res()`，且沒有開啟 passthrough，Nest 會認定 response 已由 handler 接管。這個判斷發生在最終 reply 階段，不代表 guards、pipes 或整條 interceptor chain 都被移除。

因此有兩種主要修法：

### 解法一：回到標準模式

如果只是要回傳資料，移除 `@Res()` 與 `res.json()`：

```typescript
@Get()
getPost(): Post {
  return DEMO_POST;
}
```

這是最簡單、也最不容易漏掉全域回應規則的寫法。

### 解法二：只借用 response，開啟 passthrough

需要動態設定 cookie 或 header 時：

```typescript
@Get('passthrough')
getPostWithPassthrough(@Res({ passthrough: true }) response: Response): Post {
  response.setHeader('x-demo-mode', 'passthrough');
  return DEMO_POST;
}
```

開啟 passthrough 後不要再手動送出 body，否則原生 response 與 Nest 都可能嘗試完成同一個請求。

真正需要完全掌控串流或特殊平台 API 時，可以保留 `@Res()`；但這代表 status、headers、body 與結束 response 都由該 handler 負責，也必須自行承擔平台耦合與測試成本。

## 8. 延伸提醒

依賴 handler 回傳值的後處理不只有自訂 envelope。`ClassSerializerInterceptor` 也需要取得回傳物件，才能套用 `@Exclude()` 等序列化規則。若先把未處理物件交給 `res.json()`，敏感欄位可能已經送出，後續轉換再正確也來不及改變 client 收到的內容。

這不表示 exception filters、guards、pipes 或所有 interceptors 一律失效；應逐項判斷該功能是否依賴 Nest 的標準 response handling。

## 9. 驗收結果

| 端點                 | Interceptor 診斷 header | 自訂 header | Response body    |
| -------------------- | ----------------------- | ----------- | ---------------- |
| `/posts`             | 有                      | 無          | `{ data: post }` |
| `/posts/manual`      | 有                      | 無          | `post`           |
| `/posts/passthrough` | 有                      | 有          | `{ data: post }` |

最終應能說明：

> `@Res()` 不是把 Nest 的前後處理全部關掉，而是把「最後由誰送出 response」的責任交給 Controller；因此依賴標準 reply 的轉換結果不會自動出現在 client 端。

## 參考資料

- [NestJS Controllers－Library-specific approach](https://docs.nestjs.com/controllers#library-specific-approach)
- [NestJS Interceptors－Response mapping](https://docs.nestjs.com/interceptors#response-mapping)
- [NestJS Serialization](https://docs.nestjs.com/techniques/serialization)
