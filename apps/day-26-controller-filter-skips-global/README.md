# Day 26 練習題：Controller 的 Exception Filter 為什麼讓 Global Filter 消失？

## 1. 題目背景

團隊透過 `APP_FILTER` 註冊了一個全域 Exception Filter，負責統一錯誤格式、隱藏未知錯誤細節，並留下全域處理標記：

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<unknown> {
  catch(exception: unknown, host: ArgumentsHost): void {
    // 回傳 x-error-filter: global
  }
}
```

後來某個 Posts Controller 為了自訂 404 格式，又掛上一個 Controller-scoped Filter：

```typescript
@Controller('posts')
// 將下一行註解掉，可觀察同一個 NotFoundException 改由 Global Filter 處理
@UseFilters(HttpExceptionFilter)
export class PostsController {}
```

奇怪的是，這個 Controller 拋出 `NotFoundException` 時，全域 Filter 的 header 標記消失了。

本題要釐清的主坑是：

> Exception Filter 不是會一層層執行的 pipeline。Nest 會從最接近 route 的 scope 開始尋找，找到第一個符合例外類型的 Filter 後就交給它處理，同一個例外不會再傳給外層 Filter。

## 2. 啟動與重現

啟動練習：

```bash
npx nest start day-26-controller-filter-skips-global
```

先呼叫會拋出 `NotFoundException` 的端點：

```bash
curl -i http://localhost:3000/posts/missing
```

接著讓同一個 Controller 拋出不符合局部 Filter 捕捉範圍的一般 `Error`：

```bash
curl -i http://localhost:3000/posts/unexpected
```

若要用相同的 `NotFoundException` 確認 Global Filter 能正常處理，請暫時註解 Controller 上的這一行：

```typescript
// @UseFilters(HttpExceptionFilter)
```

重新啟動後，再呼叫：

```bash
curl -i http://localhost:3000/posts/missing
```

也可以直接執行 E2E：

```bash
npx jest --config \
  apps/day-26-controller-filter-skips-global/test/jest-e2e.json \
  --runInBand
```

## 3. 預期結果

| 情境                    | 端點                | 拋出的例外          | HTTP status | `x-error-filter` |
| ----------------------- | ------------------- | ------------------- | ----------- | ---------------- |
| 預設                    | `/posts/missing`    | `NotFoundException` | 404         | `controller`     |
| 預設                    | `/posts/unexpected` | `Error`             | 500         | `global`         |
| 註解 `@UseFilters()` 後 | `/posts/missing`    | `NotFoundException` | 404         | `global`         |

預設情況下，`/posts/missing` 的 response header 會是：

```http
x-error-filter: controller
```

Response body：

```json
{
  "statusCode": 404,
  "message": "Post 404 not found"
}
```

`/posts/unexpected` 證明 Global Filter 仍然有效：

```http
x-error-filter: global
```

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

暫時註解 `@UseFilters(HttpExceptionFilter)` 後，`/posts/missing` 的 body 不變，但 header 會改成：

```http
x-error-filter: global
```

## 4. 問題為什麼發生？

大多數 Nest lifecycle 元件在 request 進入時，會從 global 往 controller、route 執行。Exception Filter 是例外。

Nest 尋找 Filter 的方向是：

```text
method-scoped → controller-scoped → global-scoped → built-in handler
```

更精確地說，Nest 會依這個優先順序找到第一個符合 exception 類型的 Filter。Controller 上的 Filter 宣告：

```typescript
@Catch(HttpException)
```

因此 `NotFoundException` 會先符合它。Controller Filter 的 `catch()` 執行後，Nest 不會再把同一個 exception 交給 Global Filter。

一般 `Error` 不是 `HttpException`，Controller Filter 不符合，搜尋才會繼續到捕捉所有例外的 Global Filter。

## 5. 修正方式：避免重疊責任

如果全域 Filter 負責所有 API 都必須具備的錯誤格式、request ID 或記錄行為，最小且清楚的修正是移除重疊的 `@UseFilters()`，讓例外集中進入 Global Filter：

```typescript
@Controller('posts')
export class PostsController {}
```

如果局部 Filter 確實需要完整擁有某種特殊例外，就應明確接受：該例外不會再進入 Global Filter。需要共用的記錄或格式化行為，應抽成 provider 讓兩個 Filter 主動呼叫，或透過繼承明確委派，不能期待 Nest 自動串接。

下面這種寫法也不是交棒方式：

```typescript
catch(exception: HttpException): void {
  throw exception;
}
```

Filter 之間沒有 `next()`，從 `catch()` 重新拋出 exception 不會要求 Nest 繼續執行下一個 Filter。

## 6. 給讀者的任務

1. 呼叫兩個端點，比較 status、body 與 `x-error-filter`。
2. 暫時註解 `@UseFilters(HttpExceptionFilter)`，重新呼叫 `/posts/missing` 並比較 header。
3. 畫出 method、controller、global Filter 的尋找順序。
4. 說明為什麼一般 `Error` 仍會進入 Global Filter。
5. 說明為什麼在局部 Filter 內重新 `throw` 不是可靠的交棒方式。

## 7. 提示

- `@Catch(HttpException)` 只匹配 `HttpException` 與其子類別。
- `@Catch()` 代表捕捉所有例外。
- Filter 的「global」表示它可套用於所有 controller 與 route，不代表它一定會收到每一個例外。
- Method-scoped Filter 的優先順序比 Controller-scoped Filter 更高，也會造成相同遮蔽效果。
- 把 `APP_FILTER` 改成 `app.useGlobalFilters()` 不會改變 Filter 的尋找順序。

## 8. 驗收句

完成練習後，應能說出：

> Global Filter 的全域，是適用範圍全域，不是保證每個例外都一定經過它；較近 scope 的 Filter 一旦匹配，同一個例外就不會再交給外層 Filter。

## 參考資料

- [NestJS Request lifecycle－Filters](https://docs.nestjs.com/faq/request-lifecycle#filters)
- [NestJS Exception filters](https://docs.nestjs.com/exception-filters)
- [NestJS `ExceptionsHandler` source](https://github.com/nestjs/nest/blob/master/packages/core/exceptions/exceptions-handler.ts)
- [NestJS `selectExceptionFilterMetadata` source](https://github.com/nestjs/nest/blob/master/packages/common/utils/select-exception-filter-metadata.util.ts)
