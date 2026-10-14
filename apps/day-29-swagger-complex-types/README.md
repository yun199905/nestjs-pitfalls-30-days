# Day 29 練習題：`@ApiProperty()` 什麼時候推導得出型別，什麼時候要你自己講？

## 1. 題目背景

今天要踩的坑，是以為 TypeScript 的型別足以描述「容器」與「參照」。

一個文章發布 API 已經寫好了。DTO 裡有標籤陣列、有巢狀的作者，作者還會指回他的精選文章，發布通路是一個 enum 陣列，另外還有一個可能是字串也可能是數字的外部識別碼，以及一組二維的 SEO 關鍵字。每個欄位都掛了 `@ApiProperty()`，TypeScript 型別也一個都沒少。

實際送出 request 時，NestJS 收得完完整整。然而打開 Swagger UI，陣列變成字串陣列、enum 陣列變成單一 enum、巢狀作者指回文章的那一段是空的 `object`、union 型別也是空的 `object`，二維陣列則被壓平成一維。

這一題最重要的判斷是：

> `@ApiProperty()` 能自動推導的只有 `design:type` 留得下來的東西。容器、值域與型別組合需要明確描述；跨檔案循環參照還要延後求值，直接傳入 DTO class 仍可能太早。

本練習保留兩組可以直接比較的端點：

- `POST /posts/broken`：runtime 正常，但 OpenAPI 對複雜型別的描述是錯的。
- `POST /posts/correct`：runtime 行為完全相同，schema 完整。

專案目前沒有啟用 Swagger CLI plugin，因此 DTO properties 必須明確提供 Swagger metadata。這不是 bug，而是 `@nestjs/swagger` 11.4.7 在 runtime reflection 下的預期行為——`emitDecoratorMetadata` 對 `TagDto[]` 只能告訴 Swagger「這是一個 `Array`」，元素型別在編譯後就不存在了。

本練習的 handler 只做 echo，不掛 `ValidationPipe`，這裡專注在文件層。

### 先建立判準：哪些不用宣告，哪些一定要

| 欄位型別                  | reflection 留下什麼 | 要不要自己宣告                                |
| ------------------------- | ------------------- | --------------------------------------------- |
| `string` / `number` / `boolean` / `Date` | 對應的建構子 | **不用**，`@ApiProperty()` 就夠               |
| 巢狀 DTO（無循環）        | 那個 class          | **不用**（但跨模組循環時要，見現象四）        |
| `Dto[]` / `string[]`      | 只有 `Array`        | **要**：`type: [Dto]` 或 `type + isArray`     |
| `enum`                    | 底層純量型別        | **要**：`enum: X`（建議再加 `enumName`）      |
| `enum[]`                  | 只有 `Array`        | **要**：`enum: X` **且** `isArray: true`      |
| 互相參照的 DTO            | 可能是 `undefined`  | **要**：兩側都寫 `type: () => Dto`            |
| `A \| B`（union）         | 只有 `Object`       | **要**：用 `oneOf`                            |
| `T[][]`（多維）           | 只有 `Array`        | **要**：用 `items` 逐層明寫                   |

下面四個現象，就是這張表後六列各自出錯的樣子。

### 啟動練習

```bash
npx nest start day-29-swagger-complex-types
# Swagger UI  http://localhost:3000/api
# OpenAPI     http://localhost:3000/api-json

npx jest --config apps/day-29-swagger-complex-types/test/jest-e2e.json --runInBand
npx jest apps/day-29-swagger-complex-types/src
```

## 2. 初始錯誤程式碼

錯誤版的三個 DTO：

```typescript
// broken-tag.dto.ts
export class BrokenTagDto {
  @ApiProperty({ description: '標籤名稱' })
  name: string;

  @ApiProperty({ description: '標籤代稱' })
  slug: string;
}

// broken-post.dto.ts
export class BrokenPostDto {
  @ApiProperty({ description: '文章標題' })
  title: string;

  @ApiProperty({ description: '瀏覽次數' })
  viewCount: number;

  @ApiProperty({ description: '是否發布' })
  published: boolean;

  @ApiProperty({ description: '建立時間' })
  createdAt: Date;

  @ApiProperty()
  tags: BrokenTagDto[];

  @ApiProperty({ enum: PublishChannel })
  channels: PublishChannel[];

  @ApiProperty()
  externalRef: string | number;

  @ApiProperty()
  keywordGroups: string[][];

  @ApiProperty({ type: BrokenAuthorDto })
  author: BrokenAuthorDto;
}

// broken-author.dto.ts（和 broken-post.dto.ts 互相 import）
export class BrokenAuthorDto {
  @ApiProperty({ description: '作者顯示名稱' })
  displayName: string;

  @ApiProperty({ type: BrokenPostDto })
  featuredPost: BrokenPostDto;
}
```

Controller 只收單篇文章：

```typescript
@Post('broken')
createBroken(@Body() body: BrokenPostDto): CreatePostResponse {
  return this.day29SwaggerComplexTypesService.create('broken', body);
}
```

這段程式可以 compile，應用程式也能啟動，九個 property 都有 `@ApiProperty()`；循環的兩側甚至直接指定了對方 DTO。看起來沒有任何一處被漏掉。

## 3. Swagger UI 應觀察到的異常

先把整份 broken schema 叫出來：

```bash
curl -s localhost:3000/api-json | jq '.components.schemas.BrokenPostDto.properties'
```

```json
{
  "title":         { "type": "string", "description": "文章標題" },
  "viewCount":     { "type": "number", "description": "瀏覽次數" },
  "published":     { "type": "boolean", "description": "是否發布" },
  "createdAt":     { "type": "string", "format": "date-time", "description": "建立時間" },
  "tags":          { "type": "array", "items": { "type": "string" } },
  "channels":      { "type": "string", "enum": ["web", "app", "newsletter"] },
  "externalRef":   { "type": "object" },
  "keywordGroups": { "type": "array", "items": { "type": "string" } },
  "author":        { "$ref": "#/components/schemas/BrokenAuthorDto" }
}
```

`title`、`viewCount`、`published` 與 `createdAt` 這四個基本型別欄位是正確的；其餘複雜型別則各自少了關鍵資訊。

### 現象一：陣列的元素型別被填成預設的 `string`

`tags` 的 TypeScript 型別是 `BrokenTagDto[]`，schema 卻說 items 是 `string`。而且：

```bash
curl -s localhost:3000/api-json | jq '.components.schemas | keys'
```

`BrokenTagDto` **不在這份清單裡**。它明明有 `@ApiProperty()`、明明被引用了，卻從來沒有被掃描過——因為 `items` 一旦被填成 `string`，Swagger 就沒有理由再往下找它。

### 現象二：enum 陣列被描述成單一 enum

`channels` 的型別是 `PublishChannel[]`，schema 卻是 `{ "type": "string", "enum": [...] }`。**文件宣告只能送一個字串，後端實際收的是陣列。**

注意這個錯誤的方向和其他幾個相反：它讓文件比實際**更嚴格**，照文件串接的人會少送資料，而且不會收到任何錯誤。

再比較兩邊的 `components.schemas`：correct 版多出一個具名的 `PublishChannel`，broken 版沒有。那是 `enumName` 的作用——沒有它，enum 會在每個用到的地方被 inline 展開一次。

### 現象三：union 變成空的 `object`，多維陣列被壓平

`externalRef` 的型別是 `string | number`，schema 是 `{ "type": "object" }`——完全沒有描述到任何一種可能。

`keywordGroups` 的型別是 `string[][]`，schema 是 `{ "type": "array", "items": { "type": "string" } }`——**少了一層**。這個特別陰險，因為它看起來是一個合理的字串陣列，不比對根本看不出維度掉了。

### 現象四：循環的巢狀 DTO，只有一個方向壞掉

```bash
curl -s localhost:3000/api-json | jq '.components.schemas.BrokenAuthorDto'
```

```json
{
  "type": "object",
  "properties": {
    "displayName": { "type": "string", "description": "作者顯示名稱" },
    "featuredPost": { "type": "object" }
  },
  "required": ["displayName", "featuredPost"]
}
```

`BrokenPostDto.author` 的 `$ref` 是正常的，只有反方向的 `featuredPost` 壞掉。同一組循環關係、同樣直接指定 eager type，兩邊仍因求值時機不同而得到不同結果。

### 最後確認 runtime 完全正常

```bash
curl -s -X POST localhost:3000/posts/broken -H 'Content-Type: application/json' -d '{
  "title": "同一個 DTO，三個世界",
  "viewCount": 321,
  "published": true,
  "createdAt": "2026-10-13T08:00:00.000Z",
  "tags": [{ "name": "nestjs", "slug": "nestjs" }],
  "channels": ["web", "app"],
  "externalRef": "POST-2026-0913",
  "keywordGroups": [["nestjs", "nest"], ["swagger", "openapi"]],
  "author": { "displayName": "Cindy", "featuredPost": { "title": "容器與內容物", "viewCount": 42, "published": false, "createdAt": "2026-10-12T08:00:00.000Z", "tags": [], "channels": ["newsletter"], "externalRef": 42, "keywordGroups": [], "author": { "displayName": "Cindy" } } }
}'
```

整個巢狀結構原樣回傳，一個欄位都沒掉。**所有異常全都只存在於文件層，資料流沒有任何問題。**

### Swagger 的 circular reference ≠ runtime 的 circular reference

|                | Swagger schema 的循環（本題）    | runtime JSON 的循環（Day 26）               |
| -------------- | -------------------------------- | ------------------------------------------- |
| 出問題的東西   | `PostDto` ↔ `AuthorDto`（DTO）   | `Post` ↔ `User`（Entity）                    |
| 發生時機       | 產生 OpenAPI 文件時              | 回應序列化時                                |
| 症狀           | 文件裡少一段參照，`type: object` | `JSON.stringify()` 直接拋錯                 |
| 有沒有錯誤訊息 | **沒有**，靜默降級               | 有，`Converting circular structure to JSON` |
| 修法           | 兩側都用 `type: () => Dto`       | 別直接回傳 Entity，改用 response DTO        |

Day 26 的循環會把應用打爆，你一定會知道；本題的循環只是讓文件少一段，**應用啟動正常、request 也正常**，除非有人去讀 schema，否則不會有人發現。

## 4. 給讀者的任務

**現象一（陣列）**

1. 說明為什麼 `tags` 的 `items` 會是 `string`，而不是 `BrokenTagDto`。
2. 說明為什麼 `BrokenTagDto` 完全沒有出現在 `components.schemas` 裡。
3. 寫出宣告陣列元素型別的**兩種**方式，並說明它們的關係。

**現象二（enum）**

4. 說明 `channels` 為什麼變成單一 enum，並讓它正確描述成 enum 陣列。
5. 說明 `enumName` 做了什麼，以及不加它會有什麼後果。

**現象三（邊界情況）**

6. 讓 `externalRef` 在文件上正確表達「字串或數字」。
7. 讓 `keywordGroups` 在文件上保留兩層維度，並說明為什麼 `type: [[String]]` 不是可行的答案。

**現象四（lazy type）**

8. 說明為什麼同一組循環關係只有一個方向壞掉。
9. 讓循環關係的兩個方向都產生 `$ref`，並說明為什麼**兩側都要改**。
10. 說清楚本題的 circular reference 和 Day 26 的 circular reference 差在哪裡。

不要用 `@ApiBody({ schema: {...} })` 手寫一整段 raw schema 來繞過這四個現象。本題要修的是 DTO 對容器、值域與參照的描述。

## 5. 可以逐步提供的提示

### 提示一

先確認問題出在 document 本身，而不是 UI：`curl -s localhost:3000/api-json | jq '.components.schemas | keys'`。如果某個 DTO 根本不在這個清單裡，代表它從來沒被掃描到。

### 提示二（現象一）

`emitDecoratorMetadata` 對 `BrokenTagDto[]` 這個型別，執行期只留下 `Array`。想一想：Swagger 拿到「這是一個 Array」之後，還能從哪裡知道元素是什麼？如果沒有地方可以知道，它會填什麼進 `items`？

去 `node_modules/@nestjs/swagger/dist/services/schema-object-factory.js` 搜 `defaultOnArray`，你會看到它挑了什麼。

### 提示三（現象一）

第 1 題和第 2 題是連在一起的。`items` 被填成 `string` 之後，Swagger 沒有任何理由去掃描 `BrokenTagDto`——所以那個 DTO 的 schema 不會產生，它底下的巢狀結構也不會被解析。修好容器的描述，被漏掉的 model 會一起回來。

### 提示四（現象二）

`@ApiProperty()` 的 options 裡，`enum` 和 `isArray` 是兩件獨立的事：一個描述「值域」，一個描述「容器」。只給 `enum`，Swagger 只會知道值域。

`enumName` 則是第三件獨立的事：它決定這個 enum 要被 inline 展開，還是抽成 `components.schemas` 裡可以重複引用的一員。

### 提示五（現象三）

`type` 這個 option 只能表達「一種型別」或「一層陣列」。`string | number` 是兩種型別，`string[][]` 是兩層陣列——兩者都超出 `type` 的表達能力。

去看 `ApiPropertyOptions` 的型別定義（`dist/decorators/api-property.decorator.d.ts`），它繼承了 `SchemaObject`。那裡面有哪些 keyword 可以用來描述「多選一」和「一層包一層」？

### 提示六（現象四）

想清楚 decorator options 是「什麼時候」被求值的。`type: Dto` 會在 class 定義階段立即讀取 DTO；即使明確指定 `type`，另一個檔案的 class 仍可能尚未定義完成。

`@nestjs/swagger` 對這個情境有一個現成的機制：把型別包在一個函式裡延後求值。想一下為什麼「延後」能解決「還沒定義完」。

### 提示七

修好之後，用同一份 JSON 對 broken 和 correct 兩個端點各送一次，確認回傳完全一樣。這一題從頭到尾沒有任何 runtime 行為需要改。

## 6. 最終驗收條件

**runtime**

- 應用程式可以正常 compile、啟動（注意：`nest build` 會做型別檢查，`type: [[String]]` 這種寫法過不了）。
- 兩個端點用同一份 JSON 都能在 runtime 原樣收到整個巢狀結構。

**基本型別**

- `title`、`viewCount`、`published` 與 `createdAt` 在 broken 與 correct 兩版都能從 `design:type` 產生正確 schema。
- `createdAt` 在 OpenAPI schema 中是 `{ "type": "string", "format": "date-time" }`；這不代表收到的 JSON 字串會自動轉成 `Date` instance。

**現象一**

- `PostDto.tags` 是 `{ "type": "array", "items": { "$ref": ".../TagDto" } }`。
- `TagDto` 出現在 `components.schemas` 裡。

**現象二**

- `PostDto.channels` 是 `{ "type": "array", "items": { "$ref": ".../PublishChannel" } }`。
- `PublishChannel` 以具名 schema 出現在 `components.schemas` 裡。

**現象三**

- `PostDto.externalRef` 用 `oneOf` 同時描述 `string` 與 `number`。
- `PostDto.keywordGroups` 是 `{ "type": "array", "items": { "type": "array", "items": { "type": "string" } } }`。

**現象四**

- `PostDto.author` 與 `AuthorDto.featuredPost` **兩個方向都是 `$ref`**。

**整體**

- correct 版的所有 schema 裡，沒有任何 property 是裸的 `{ "type": "object" }`。
- 能說明這些異常是 metadata 不足造成的預期結果，而不是 Swagger UI 的 bug。

自動化測試會檢查兩個端點的 runtime response、上述 schema 差異，以及循環關係在兩側的實際輸出。

## 7. 解答與原因說明

### 現象一：容器與元素要分開描述

```typescript
@ApiProperty({ type: [TagDto] })
tags: TagDto[];
```

`emitDecoratorMetadata` 對 `TagDto[]` 只會告訴 Swagger「這是一個 `Array`」，元素型別在編譯後不存在。Swagger 沒有線索可以推斷，於是套用預設值 `string`。

`items` 一旦被填成 `string`，Swagger 就沒有理由去掃描 `TagDto`，那個 model 的 schema 自然不會產生。**修好容器的描述，被漏掉的 model 會一起回來。**

陣列有兩種等價寫法，挑順眼的用：

```typescript
@ApiProperty({ type: [TagDto] })          // 簡寫
@ApiProperty({ type: TagDto, isArray: true })  // 展開
```

`@nestjs/swagger` 內部會把前者拆成後者。

### 現象二：`enum`、`isArray`、`enumName` 是三件獨立的事

```typescript
@ApiProperty({
  enum: PublishChannel,
  enumName: 'PublishChannel',
  isArray: true,
  description: '發布通路',
})
channels: PublishChannel[];
```

- `enum` 描述**值域**：這個值可以是哪些。
- `isArray` 描述**容器**：外面有沒有包一層陣列。只給 `enum`，Swagger 會把 property 的型別設成該 enum 的純量型別（本題是 `string`），結果就是一個單一 enum。
- `enumName` 決定**要不要抽成具名 schema**。沒有它，enum 會在每個用到的地方被 inline 展開；有了它，`components.schemas` 會多出一個 `PublishChannel`，各處改用 `$ref` 引用。

單一 enum 的版本不加 `isArray` 就好：

```typescript
@ApiProperty({ enum: PublishChannel, enumName: 'PublishChannel' })
primaryChannel: PublishChannel;
```

### 現象三：`type` 表達不了的兩種形狀

`type` 這個 option 只能表達「一種型別」或「一層陣列」。遇到超出它能力的形狀，要下降到 OpenAPI 的原生 keyword。

**union 用 `oneOf`：**

```typescript
@ApiProperty({
  oneOf: [{ type: 'string' }, { type: 'number' }],
  description: '外部系統的文章識別碼',
})
externalRef: string | number;
```

`string | number` 在 runtime 只剩 `Object`，Swagger 不可能推得出來。`oneOf` 是 OpenAPI 描述「多選一」的標準做法，`anyOf`／`allOf` 也在 `ApiPropertyOptions` 裡（它繼承了 `SchemaObject`）。

**多維陣列用 `items` 逐層明寫：**

```typescript
@ApiProperty({
  type: 'array',
  items: { type: 'array', items: { type: 'string' } },
  description: 'SEO 關鍵字分組',
})
keywordGroups: string[][];
```

注意 `type: [[String]]` **不是可行的答案**：它在 runtime 碰巧能動，但 `ApiPropertyOptions` 的 `type` 只接受 `[Function]` 單層，`nest build` 會直接噴 TS2345。多維陣列是這套簡寫語法唯一表達不了的情況。

### 現象四：問題出在求值順序，不是循環本身

關鍵不是「有沒有指定 `type`」，而是「decorator options 在什麼時候讀取這個 `type`」。

`type: Dto` 會在 `@ApiProperty()` 建立時立即讀取 DTO。兩個檔案互相 import 時，模組只會被求值一次：

1. controller 先 import `broken-post.dto.ts`
2. 它 import `broken-author.dto.ts`
3. `broken-author.dto.ts` 又 import `broken-post.dto.ts`——這時候它拿到的是一個**還沒定義完**的模組，`BrokenPostDto` 是 `undefined`
4. `BrokenAuthorDto` 的 `type: BrokenPostDto` 在這個狀態下立即求值，取得 `undefined`；本篇編譯設定又讓 `design:type` 回退成 `Object`，`@ApiProperty()` 因而沿用這份 metadata，所以 `featuredPost` 最後退化成普通物件
5. 回到 `broken-post.dto.ts` 繼續執行，此時 `BrokenAuthorDto` 已經定義完成，所以 `type: BrokenAuthorDto` 能拿到正確的 class，`author` 也能產生 `$ref`

所以直接傳入 DTO class 並沒有解除對載入順序的依賴。換一下 import 順序，壞掉的方向就可能換人；在其他模組系統或打包方式下，也可能在載入階段直接拋錯。

```typescript
@ApiProperty({ type: () => AuthorDto })
author: AuthorDto;
```

`type: Dto` 會立即取值；`type: () => Dto` 則把型別包在函式裡，`@nestjs/swagger` 要到產生文件時才呼叫它，那時候所有模組都已經載入完成。**兩側都要寫 lazy type**，因為你不知道（也不該依賴）哪一側會先被求值。

順帶一個對照：同一個 class 內的**自我參照**（例如 `parent: CategoryDto` 指向自己）不需要 lazy resolver 也能正確產生 `$ref`。這也印證了根因是跨模組的求值順序，不是「循環」本身。

### 最後：不會有人提醒你

`SwaggerModule.createDocument()` 遇到這些情況不會拋錯、不會警告，`nest start` 的 log 一片乾淨。所有異常沒有任何一個會讓應用起不來。

而那份 schema 會被拿去產生前端的 client、餵給契約測試、或直接當成規格書交給串接方。錯誤不會消失，只是換一個更晚、更貴的地方爆開。

> Swagger 只推導得出 `design:type` 留得下來的東西：容器裝什麼、值域是什麼、指向哪個 class，都要你自己寫上去。
