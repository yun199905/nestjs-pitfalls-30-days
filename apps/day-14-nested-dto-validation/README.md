# Day 14｜隱形的層級：為什麼巢狀 DTO 驗證不生效？`@ValidateNested` 沒告訴你的事

## 練習目標

巢狀 DTO 的外層欄位即使已經加上 `@ValidateNested()`，內層驗證仍可能沒有執行。這份練習會用兩條路由比較相同的請求資料，確認缺少與加入 `@Type()` 時的行為差異。

專案已經在 `main.ts` 全域掛載：

```ts
new ValidationPipe({
  transform: true,
});
```

`transform: true` 會讓轉換後的 DTO 實例傳入 Controller，但不會自動推斷巢狀欄位應該轉換成哪一個 DTO 類別。要讓 `postMeta` 成為 `PostMetaDto` 的實例，仍然需要明確使用 `@Type(() => PostMetaDto)`。

## 啟動練習

在 repo 根目錄執行：

```bash
pnpm exec nest start day-14-nested-dto-validation --watch
```

本練習提供兩條對照路由：

```text
POST /posts/without-type  缺少 @Type() 的錯誤版
POST /posts/with-type     加入 @Type() 的正解版
```

## 準備錯誤的巢狀資料

兩條路由都使用以下請求資料：

```json
{
  "title": "My first post",
  "content": "Hello NestJS",
  "postMeta": {
    "seoTitle": "",
    "seoDescription": 12345
  }
}
```

`PostMetaDto` 要求 `seoTitle` 不得為空字串，`seoDescription` 則必須是字串。送出請求前，可以先預測兩條路由會回傳 `201 Created` 還是 `400 Bad Request`。

## 第一組：只有 `@ValidateNested()`

錯誤版 DTO 的 `postMeta` 只有 `@ValidateNested()`：

```ts
@ValidateNested()
postMeta: PostMetaDto;
```

呼叫缺少 `@Type()` 的路由：

```bash
curl -i -X POST http://localhost:3000/posts/without-type \
  -H 'Content-Type: application/json' \
  -d '{"title":"My first post","content":"Hello NestJS","postMeta":{"seoTitle":"","seoDescription":12345}}'
```

預期狀態為 `201 Created`，錯誤的巢狀資料會被原樣接受：

```json
{
  "title": "My first post",
  "content": "Hello NestJS",
  "postMeta": {
    "seoTitle": "",
    "seoDescription": 12345
  }
}
```

`@ValidateNested()` 只告知驗證器需要向下檢查，卻沒有提供 `postMeta` 在執行期應該成為哪個類別的資訊。此時內層資料仍是 plain object，驗證器無法套用 `PostMetaDto` 上的欄位規則。

## 第二組：搭配 `@Type()`

正解版在相同欄位補上 `@Type(() => PostMetaDto)`：

```ts
@ValidateNested()
@Type(() => PostMetaDto)
postMeta: PostMetaDto;
```

將同一份錯誤資料送到正解版路由：

```bash
curl -i -X POST http://localhost:3000/posts/with-type \
  -H 'Content-Type: application/json' \
  -d '{"title":"My first post","content":"Hello NestJS","postMeta":{"seoTitle":"","seoDescription":12345}}'
```

預期狀態為 `400 Bad Request`。`@Type()` 讓 `class-transformer` 能將 `postMeta` 實例化為 `PostMetaDto`，因此 `class-validator` 可以讀取並執行內層欄位的驗證規則。

## 確認有效資料可以通過

將符合規則的巢狀資料送到正解版路由：

```bash
curl -i -X POST http://localhost:3000/posts/with-type \
  -H 'Content-Type: application/json' \
  -d '{"title":"My first post","content":"Hello NestJS","postMeta":{"seoTitle":"NestJS Validation Tips","seoDescription":"How nested DTO validation works in NestJS"}}'
```

預期狀態為 `201 Created`，並回傳相同資料：

```json
{
  "title": "My first post",
  "content": "Hello NestJS",
  "postMeta": {
    "seoTitle": "NestJS Validation Tips",
    "seoDescription": "How nested DTO validation works in NestJS"
  }
}
```

## 根因流程

兩個裝飾器的責任不同：

```text
HTTP 請求中的 postMeta（plain object）
                ↓
@Type(() => PostMetaDto)：建立 PostMetaDto 實例
                ↓
@ValidateNested()：要求驗證器向下檢查
                ↓
class-validator：執行 PostMetaDto 的欄位規則
```

- `@ValidateNested()` 負責告知驗證器向下檢查。
- `@Type()` 負責將 plain object 實例化成指定的 DTO 類別實例。
- 內層 DTO 實例建立後，`class-validator` 才能套用該類別的驗證規則。

## 執行自動測試

```bash
pnpm exec jest --config apps/day-14-nested-dto-validation/test/jest-e2e.json --runInBand
```

自動化測試會驗證：

- 缺少 `@Type()` 時，錯誤的內層欄位仍會被接受。
- 加入 `@Type()` 時，錯誤的內層欄位會被拒絕。
- 缺少 `@Type()` 不會影響外層欄位的驗證。
- 加入 `@Type()` 後，有效的巢狀資料可以通過。

## 帶得走的判斷句

> 巢狀驗證需要同時知道「要向下驗證」，以及「內層資料屬於哪個 DTO 類別」。

只有 `@ValidateNested()` 還不夠；只要內層資料需要套用另一個 DTO 的驗證規則，就要搭配 `@Type()` 提供執行期的類別資訊。
