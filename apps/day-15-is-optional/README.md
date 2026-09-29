# Day 15｜空值的考驗：`@IsOptional()` 到底許諾了什麼？別再把「選填」跟「非空」搞混了

## 練習目標

一個更新文章標題的 API，希望提供這樣的契約：

- 不修改標題時，可以省略 `title`。
- 只要送出 `title`，它就必須是非空字串。
- `null` 不代表清除標題，因此不能通過驗證。

直覺上，下面的 DTO 好像已經把三件事都說清楚了：

```ts
export class IsOptionalUpdatePostDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;
}
```

但 `@IsOptional()` 許諾的範圍，比 TypeScript 屬性名稱旁邊的 `?` 更寬。這份練習會用兩條路由證明差異。

## 啟動練習

在 repo 根目錄執行：

```bash
pnpm exec nest start day-15-is-optional --watch
```

兩條路由分別是：

```text
PATCH /posts/:id/is-optional  錯誤版
PATCH /posts/:id/validate-if  正解版
```

在實際送出 request 前，先預測下列五種 payload 會得到 `200` 還是 `400`：

| Payload                            | `is-optional` | `validate-if` |
| ---------------------------------- | ------------- | ------------- |
| `{}`                               | ?             | ?             |
| `{ "title": null }`                | ?             | ?             |
| `{ "title": "" }`                  | ?             | ?             |
| `{ "title": 123 }`                 | ?             | ?             |
| `{ "title": "NestJS Validation" }` | ?             | ?             |

## 重現問題

先把 `title` 完全省略：

```bash
curl -i -X PATCH http://localhost:3000/posts/42/is-optional \
  -H 'Content-Type: application/json' \
  -d '{}'
```

回應是 `200 OK`，符合更新 DTO 的選填需求：

```json
{
  "id": "42"
}
```

接著明確傳入 `null`：

```bash
curl -i -X PATCH http://localhost:3000/posts/42/is-optional \
  -H 'Content-Type: application/json' \
  -d '{"title":null}'
```

它仍然回傳 `200 OK`：

```json
{
  "id": "42",
  "title": null
}
```

問題不是 `@IsNotEmpty()` 認為 `null` 是非空值，而是它根本沒有執行。

## 根因：`@IsOptional()` 是條件驗證器

在目前使用的 `class-validator` 0.14.x 中，`@IsOptional()` 會檢查欄位值是否為 `null` 或 `undefined`。只要符合其中一種情況，就跳過同一個欄位上的其他驗證器。

因此錯誤版的實際流程是：

```text
title === null 或 title === undefined
                ↓
       @IsOptional() 判定缺值
                ↓
跳過 @IsString() 與 @IsNotEmpty()
                ↓
             驗證通過
```

`title?: string` 則只是一個 TypeScript 編譯期型別。HTTP request 在 runtime 送進來時，TypeScript 不會替 DTO 拒絕 `null`、數字或其他值；真正執行檢查的是 validation decorators。

## 正解：只在 `undefined` 時跳過驗證

本題的契約是「可以省略，但不能是 `null`」，因此條件必須寫得更精確：

```ts
export class ValidateIfUpdatePostDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  title?: string;
}
```

當欄位被省略時，`value` 是 `undefined`，條件不成立，因此其他驗證器被跳過。當值是 `null` 時，條件成立，`@IsString()` 與 `@IsNotEmpty()` 都會執行並使 request 回傳 `400 Bad Request`。

```bash
curl -i -X PATCH http://localhost:3000/posts/42/validate-if \
  -H 'Content-Type: application/json' \
  -d '{"title":null}'
```

完整結果如下：

| Payload                            | 錯誤版 | 正解版 |
| ---------------------------------- | -----: | -----: |
| `{}`                               |    200 |    200 |
| `{ "title": null }`                |    200 |    400 |
| `{ "title": "" }`                  |    400 |    400 |
| `{ "title": 123 }`                 |    400 |    400 |
| `{ "title": "NestJS Validation" }` |    200 |    200 |

## 幾個容易混在一起的邊界

### JSON 沒有 `undefined`

JSON 無法直接表達 `undefined`。在 HTTP request 中，不送出 `title` 就是這份練習用來表達欄位缺席的方式。

### 疊加 `@IsDefined()` 無法補救

不要在 `@IsOptional()` 旁邊再放一個 `@IsDefined()`，期待它攔住 `null`。`@IsOptional()` 的條件不成立時，會跳過同一欄位的所有其他驗證器，`@IsDefined()` 也不例外。應該修正「何時跳過驗證」的條件，而不是再疊一個永遠不會執行的規則。

### 非空不等於非空白

`@IsNotEmpty()` 不會自動 trim 字串；`"   "` 並不是空字串。若業務規則還要求標題不能只有空白，應明確加入轉換或額外驗證規則，不要把另一個契約偷偷塞進本題。

### 空物件 PATCH 是另一個問題

正解仍然允許 `{}`，因為本題只定義單一欄位的選填規則。若 API 要求一次至少更新一個欄位，那是跨欄位或業務層規則，應另外處理。

## 執行自動測試

```bash
pnpm exec jest --config apps/day-15-is-optional/test/jest-e2e.json --runInBand
```

## 帶得走的判斷句

> 選填決定欄位能不能缺席；非空決定欄位出席時能帶什麼值。

在使用 `@IsOptional()` 前，先確認你的 API 是否真的把 `null` 和「沒有傳」視為同一件事。
