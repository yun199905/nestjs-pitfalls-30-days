# Day 13｜消失的 Class 實例：`transform: false` 到底保留了什麼，又丟掉了什麼？

## 練習目標

這個練習要拆解一個容易被名稱誤導的設定：

```ts
new ValidationPipe({ transform: false });
```

`transform: false` 並不代表 `ValidationPipe` 完全不會建立 DTO。當參數型別是 class 時，NestJS 仍會先將 plain payload 轉成暫時的 DTO instance，讓 `class-transformer` 與 `class-validator` 完成轉換和驗證；差別在於驗證成功後，Controller 不一定會拿到這個 instance。

本練習使用三條路由，讓同一份 request body 走過不同設定並直接比較 runtime 結果。

## 啟動專案

在 repo 根目錄執行：

```bash
pnpm exec nest start day-13-validation-transform --watch
```

啟動後打開 Swagger UI：

```text
http://localhost:3000/api
```

展開 `posts` 分組後，三條路由都可以直接按 **Try it out**。Swagger 已經替前兩條路由預填字串 `viewCount` 與帶空白的標題；whitelist 路由則會另外帶入 `extraNote`，適合逐條執行並比較 response。以下也保留 `curl` 指令，方便從終端機重現。

準備以下 payload：

```json
{
  "title": "  NestJS Pipes  ",
  "viewCount": "12"
}
```

在送出請求前，先預測每條路由中的 `title`、`viewCount`、`visibility`、`instanceof` 與 `createSlug()` 會是什麼結果。

## 第一組：`transform: false`

```bash
curl -X POST http://localhost:3000/posts/transform-off \
  -H 'Content-Type: application/json' \
  -d '{"title":"  NestJS Pipes  ","viewCount":"12"}'
```

預期回應：

```json
{
  "isDtoInstance": false,
  "hasCreateSlug": false,
  "receivedBody": {
    "title": "  NestJS Pipes  ",
    "viewCount": "12"
  }
}
```

`@Transform()` 與 `@Type()` 確實在暫時的 DTO 上執行，否則字串形式的 `viewCount` 無法通過 `@IsInt()`。但預設設定下，驗證完成後傳回 Controller 的仍是原始 plain object，所以空白與字串型別都還在，class 預設值與 prototype 方法則不存在。

## 第二組：`transform: true`

```bash
curl -X POST http://localhost:3000/posts/transform-on \
  -H 'Content-Type: application/json' \
  -d '{"title":"  NestJS Pipes  ","viewCount":"12"}'
```

預期回應：

```json
{
  "isDtoInstance": true,
  "hasCreateSlug": true,
  "receivedBody": {
    "title": "NestJS Pipes",
    "viewCount": 12,
    "visibility": "draft"
  }
}
```

這次 Controller 收到的就是轉換與驗證時建立的 `CreatePostDto` instance，因此轉換後的值、class 欄位初始值與 prototype 方法都存在。

## 第三組：`transform: false` 加上 `whitelist: true`

這組才額外傳入沒有 validation decorator 的 `extraNote`，用來觀察 whitelist 是否會將它移除。

```bash
curl -X POST http://localhost:3000/posts/transform-off-whitelist \
  -H 'Content-Type: application/json' \
  -d '{"title":"  NestJS Pipes  ","viewCount":"12","extraNote":"client-only"}'
```

預期回應：

```json
{
  "isDtoInstance": false,
  "hasCreateSlug": false,
  "receivedBody": {
    "title": "NestJS Pipes",
    "viewCount": 12,
    "visibility": "draft"
  }
}
```

這是本題的進階邊界。在本專案使用的 NestJS 11.1.19 中，只要提供 `whitelist` 這類 validator option，`ValidationPipe` 在 `transform: false` 時會把驗證後的暫時 instance 轉回 plain object。因此轉換值和 whitelist 結果會留下，卻仍然沒有 DTO prototype。

不要把這項內部流程當成「關閉 transform 也能可靠取得轉換結果」的技巧。下游若依賴轉換後型別、預設值或 instance 行為，應明確開啟 `transform: true`。

## 驗證真的有執行

依序對三條路由送出數字型別的標題：

```json
{
  "title": 123,
  "viewCount": "12"
}
```

三條路由都會回傳 `400 Bad Request`。`@Transform()` 只會處理字串，因此數字原樣進入暫時 DTO，接著被 `@IsString()` 擋下。

再把 `viewCount` 改成：

```json
{
  "title": "NestJS Pipes",
  "viewCount": "not-a-number"
}
```

三條路由也都會回傳 `400 Bad Request`，證明 `transform: false` 關閉的是「是否把 class instance 交給 handler」，不是驗證前建立暫時 instance 的步驟。

## 根因流程

可以把 `ValidationPipe` 的主要流程理解成：

```text
plain payload
    ↓
plainToInstance(CreatePostDto, payload)
    ↓
在暫時 DTO 上執行轉換與驗證
    ↓
依 transform 與 validator options 決定回傳 DTO instance、原始值或轉回 plain object
```

## 帶得走的判斷句

`transform: false` 保留的不是「DTO 但不轉值」，而通常是通過 DTO 規則驗證的原始 plain object。只要後續程式依賴轉換後型別、class 預設值或 prototype 方法，就應明確使用 `transform: true`。

其中 `createSlug()` 只是本練習用來觀察 prototype 是否存在的探針，不是在建議把正式業務邏輯堆進 DTO。
