# Day 24 練習題：DTO 明明有 TypeScript 型別，為什麼 Swagger 看到的不一樣？

## 1. 題目背景

今天要踩的坑，是把 TypeScript 看得懂的 DTO，誤以為 Swagger 也一定看得懂。

一個文章更新 API 已經寫好了。Controller 的 `@Body()` 有型別，DTO 中也清楚宣告了 `string`、`string[]`、`number[]` 與巢狀物件；實際送出 request 時，NestJS 也能收到完整 JSON。然而打開 Swagger UI，request schema 卻少了欄位、把巢狀 model 顯示成空泛的 `object`，甚至整支端點連 request body 都不見了。

**這一題的每一支 broken 端點只示範一個坑。** 每支 broken DTO 都是同一份欄位集的複本，只刻意壞掉其中一處，其餘一律寫成正確版本 —— 所以你比對 schema 時，diff 永遠只會有一個地方不同，症狀可以被單獨歸因。三支 broken 端點共用同一支 correct 端點，因為正解只有一種。

| 端點                                  | 只示範這一個坑                                             |
| ------------------------------------- | ---------------------------------------------------------- |
| `PATCH /posts/{id}/missing-decorator` | 問題一：property 有 TS 型別，但沒掛 `@ApiProperty()`       |
| `PATCH /posts/{id}/nested-interface`  | 問題二：巢狀型別宣告成 `interface`                         |
| `PATCH /posts/{id}/plain-partial`     | 問題三：拿 TypeScript 的 `Partial<T>` 當 body 型別         |
| `PATCH /posts/{id}/correct`           | 正解：三個坑都修好的 `UpdatePostDto`                       |

四支端點的 runtime 行為**完全一樣**：同一份 JSON 送進去，回來的都是完整內容。差別只在 OpenAPI 文件。

這一題最重要的判斷是：

> TypeScript compile-time type ≠ JavaScript runtime metadata ≠ OpenAPI schema。

專案目前沒有啟用 Swagger CLI plugin，因此 DTO properties 必須明確提供 Swagger metadata。問題不來自已不存在的舊版 bug；這正是目前安裝的 `@nestjs/swagger` 11.4.7 在 runtime reflection 下的預期行為。

`main.ts` 有掛 `app.useGlobalPipes(new ValidationPipe())`，但**沒有開 `whitelist`**，所以 request 欄位不會被刪除 —— 這正是「文件殘缺、runtime 卻完好」能同時成立的原因。本練習不會有任何 request 被後端擋下。

### 啟動練習

```bash
npx nest start day-24-swagger-api-property
# Swagger UI  http://localhost:3000/api
# OpenAPI     http://localhost:3000/api-json

npx jest --config apps/day-24-swagger-api-property/test/jest-e2e.json --runInBand
```

## 2. 初始錯誤程式碼

四支端點共用這一組欄位。正確版長這樣（`src/dto/request/post-fields.dto.ts`），下面每個坑都是它的複本，各自只示範一個成因：

```typescript
export class PostFieldsDto {
  title: string;
  content: string;
  tags: string[];
  publishOptions: PublishOptionsDto;
}
```

### 問題一：`src/dto/request/broken-missing-decorator.dto.ts`

```typescript
// 四個欄位都有 TypeScript 型別，但沒有任何一個掛上 decorator
class MissingDecoratorPostFieldsDto {
  title: string;

  content: string;

  tags: string[];


  publishOptions: PublishOptionsDto;
}

export class MissingDecoratorUpdatePostDto extends PartialType(
  MissingDecoratorPostFieldsDto,
) {}
```

從 TypeScript 的角度看，這個 class 很明確地包含四個欄位。送進來的 JSON 也照樣會被 handler 完整收到，因為 `ValidationPipe` 沒有開 `whitelist`，不會刪除任何欄位。

### 問題二：`src/dto/request/broken-nested-interface.dto.ts`

```typescript
interface BrokenPublishOptions {
  notifyFollowers: boolean;
}

// 只有這一個欄位壞掉，其餘欄位一律正確
@ApiProperty()
publishOptions: BrokenPublishOptions;
```

`BrokenPublishOptions` 在 TypeScript 中確實描述了巢狀資料的形狀。

### 問題三：`src/dto/request/broken-plain-partial.dto.ts`

```typescript
// base DTO（PostFieldsDto）的 metadata 是完整的，錯在拿它的「型別」當 body 型別
export type PlainPartialUpdatePostDto = Partial<PostFieldsDto>;
```

```typescript
@Patch(':id/plain-partial')
updatePlainPartial(
  @Param('id') id: string,
  @Body() body: PlainPartialUpdatePostDto,
): UpdatePostResponse {
  return this.day24SwaggerApiPropertyService.update(id, 'plain-partial', body);
}
```

`Partial<T>` 是 TypeScript 內建的 utility type，語意上就是「所有欄位變成 optional」，看起來正是 update DTO 想要的東西。這段程式可以 compile，request 也收得到完整 JSON。

## 3. Swagger UI 應觀察到的異常

啟動 day24 並開啟 `http://localhost:3000/api`。每支端點的 summary 都標了它示範的是哪個坑。

先把正解那份 schema 記下來當基準線：

```bash
curl -s localhost:3000/api-json | jq '.components.schemas.UpdatePostDto.properties | keys'
# ["title","content","tags","publishOptions"]
```

### 問題一：schema 的 properties 是空的

```bash
curl -s localhost:3000/api-json \
  | jq '.components.schemas.MissingDecoratorUpdatePostDto'
```

```json
{
  "type": "object",
  "properties": {}
}
```

四個欄位不是「顯示成錯的型別」，而是**一個都不存在**。Swagger UI 上這個 model 只會是一個空的 `{}`。

注意它和問題三的差別：這裡的 body 型別是真正的 class，所以 `requestBody` 仍然會產生，只是它指向的 schema 是空的。

再用 Swagger UI 對這支端點送出以下 request：

```json
{
  "title": "NestJS Swagger Debug",
  "content": "這些欄位一個都沒出現在 Swagger",
  "tags": ["nestjs", "swagger"],
  "publishOptions": { "notifyFollowers": true }
}
```

API 仍會回傳完整內容。這證明 runtime 是否收到 JSON，與 Swagger 是否產生完整文件，是兩件不同的事。

### 問題二：巢狀 model 只剩沒有 properties 的空殼

```bash
curl -s localhost:3000/api-json \
  | jq '.components.schemas.NestedInterfaceUpdatePostDto.properties.publishOptions'
# { "type": "object" }

curl -s localhost:3000/api-json | jq '.components.schemas | keys'
# 裡面不會有 BrokenPublishOptions
```

`publishOptions` 有出現，但 Swagger 不知道裡面還有 `notifyFollowers`，因此只顯示一般 `object`；Swagger UI 的 Example Value 只會給你一個 `{}`。對照同一支 DTO 的其他三個欄位 —— 它們都是正確的。

### 問題三：整支端點連 request body 都不見了

這支的症狀和前三個完全不同層級：

```bash
curl -s localhost:3000/api-json \
  | jq '.paths["/posts/{id}/plain-partial"].patch | keys'
# ["operationId","parameters","responses","summary","tags"]
```

`requestBody` 這個 key **根本不存在**。在 Swagger UI 上，這支 PATCH 只有一個 `id` 路徑參數，連可以貼 JSON 的欄位都沒有 —— 你無法用 Try it out 送出任何 body。`components.schemas` 裡也不會多出任何 schema，儘管 `PostFieldsDto` 本身的 metadata 是完整的。

## 4. 給讀者的任務

每支 broken 端點只示範一個成因，請逐支完成 Debug：

**問題一（`/missing-decorator`）**

1. 找出四個欄位全部從 OpenAPI schema 消失的原因，並說明為什麼 runtime 還是收得到它們。
2. 說明 `PartialType()` 實際從 base DTO 繼承了什麼，而不是只回答「它把型別變成 optional」——為什麼它一個欄位都補不出來？

**問題二（`/nested-interface`）**

3. 解釋 `publishOptions` 為什麼只能顯示成沒有 properties 的 `object`，且 `components.schemas` 裡找不到它。

**問題三（`/plain-partial`）**

4. base DTO 的 metadata 是完整的，為什麼這支端點連 `requestBody` 都沒有產生？
5. 確認 Swagger DTO 情境下 `PartialType()` 應該從哪個 package 匯入，並說明它和 TypeScript 的 `Partial<T>` 差在哪。

**整體**

6. 提出一組 class-based DTO，使 update schema 完整，且全部頂層欄位維持 optional。

不要把 `@ApiBody()` 寫成一大段手動 raw schema 來掩蓋 DTO 問題。本題要修正的是 DTO 可供 Swagger 使用的 metadata。

## 5. 可以逐步提供的提示

### 提示一

Swagger UI 只是 OpenAPI document 的呈現結果。可以先查看 `http://localhost:3000/api-json`，確認問題已經存在於 `components.schemas` 與 `paths`，而不是 UI 沒有更新。

### 提示二（問題一）

拿這支 DTO 和正解的 `PostFieldsDto` 並排比較。兩邊的 TypeScript 型別完全一樣，差別只在有沒有在 class prototype 上登記 Swagger 需要的 property metadata。

### 提示三（問題一）

先看 base DTO 自己擁有哪些 Swagger properties，再思考 `PartialType(BaseDto)` 能複製哪些東西。Mapped Type 可以轉換既有 metadata，不能從只存在於 TypeScript AST 的 property 憑空建立 metadata。

### 提示四（問題二）

`emitDecoratorMetadata` 能保留的資訊有限，而且 interface 在 TypeScript 編譯成 JavaScript 時會被移除。檢查 `publishOptions` 在 runtime 最後還能被辨識成哪一種 constructor。

### 提示五（問題三）

`Partial<T>` 只是型別層的轉換，編譯後不會留下任何東西；`@Body()` 拿得到的 `design:paramtypes` 只剩 `Object`。Swagger 需要的是一個**真的存在於 runtime 的 class**。

Swagger/OpenAPI DTO 的 `PartialType()` 應從 `@nestjs/swagger` 匯入。不要因為名稱相同，就把它只當成一般 TypeScript utility 或改從其他 package 匯入。

本 repo 並未直接依賴 `@nestjs/mapped-types`，直接從該 package 匯入還會讓目前的 pnpm 專案無法 resolve module。即使其他專案有安裝它，Swagger 情境仍應使用 `@nestjs/swagger` 提供、會處理 OpenAPI metadata 的版本。

## 6. 最終驗收條件

完成 Debug 後，應能驗證以下結果：

**runtime（所有端點）**

- 應用程式可以正常 compile、啟動。
- 四支 PATCH 端點都能在 runtime 收到完整 JSON，回傳內容一致（只有 `variant` 不同）。

**問題一**

- 四個欄位都出現在 schema 的 `properties` 中，不再是空的 `{}`。

**問題二**

- `publishOptions` 指向具名的 `PublishOptionsDto`（`$ref`），其中包含 boolean `notifyFollowers`。

**問題三**

- 端點的 operation 有 `requestBody`，且指向具名 schema，不是裸 `object`、也不是缺席。
- `UpdatePostDto` 沒有 required list；五個頂層 properties 都是 optional。

**整體**

- 能說明每一支 broken schema 都是 metadata 不足或不同步造成的預期結果，而不是 Swagger UI bug。

自動化測試會逐坑檢查上述 OpenAPI schema 差異，並確認四支端點的 runtime response 一致。

## 7. 解答與原因說明

### 問題一：沒登記就不存在

`@ApiProperty()` 不是在幫 TypeScript 補型別，而是在登記 Swagger/OpenAPI metadata。沒有這個 decorator，property 只存在於 TypeScript 的 AST，編譯後 class prototype 上什麼都不會留下 —— Swagger 掃不到，就不會出現在文件裡。

`PartialType()` 也不只是型別層的 `Partial<T>`：從 `@nestjs/swagger` 匯入時，它會建立新的 class、複製 base DTO **已有的** Swagger metadata，並將這些 properties 標記為 optional。

關鍵字是「已有」。base DTO 一個欄位都沒登記，mapped type 自然沒有東西可以複製，產出的就是 `properties: {}`。所以問題一的症狀不是 `PartialType()` 造成的，而是它上游造成的 —— 這也是為什麼這兩件事不該分成兩支端點來示範。

### 問題二：interface 在 runtime 不存在

interface 是純型別層的東西，編譯成 JavaScript 之後不留任何痕跡。`@ApiProperty()` 拿到的 `design:type` 只會是 `Object`，runtime 沒有一個 `BrokenPublishOptions` constructor 可以讓 Swagger 繼續往下掃，因此只能產出 `type: 'object'`。

改成會存在於 JavaScript runtime 的 class，並為 property 提供 Swagger metadata：

```typescript
class PublishOptionsDto {
  @ApiProperty({ description: '發布時是否通知追蹤者' })
  notifyFollowers: boolean;
}
```

```typescript
@ApiProperty({ type: () => PublishOptionsDto })
publishOptions: PublishOptionsDto;
```

`type: () => PublishOptionsDto` 的 lazy resolver 寫法可以避開 module 互相 import 時的初始化順序問題，巢狀 DTO 建議一律這樣寫。

### 問題三：`Partial<T>` 與 `PartialType()` 是兩種完全不同的東西

|                | TypeScript `Partial<T>`     | `@nestjs/swagger` 的 `PartialType()`          |
| -------------- | --------------------------- | --------------------------------------------- |
| 它是什麼       | 型別層的 mapped type        | 一個 function，會回傳新的 class               |
| 編譯後還在嗎   | 不在，完全消失              | 在，是真實的 JavaScript class                 |
| `design:paramtypes` 拿到什麼 | `Object`      | 那個新 class                                  |
| Swagger 看得到 | 什麼都看不到                | base DTO 已登記的 metadata，全部轉成 optional |

`@Body() body: Partial<PostFieldsDto>` 的 `design:paramtypes` 只剩 `Object`。Swagger 連一個 class 都拿不到，就不會產生 `requestBody`，`components.schemas` 也不會多出任何東西 —— 即使 `PostFieldsDto` 自己的 metadata 完整無缺。錯的不是 base DTO，是「拿它的型別而不是拿它本身」。

正解是從 metadata 完整的 class 建立 update DTO：

```typescript
import { PartialType } from '@nestjs/swagger';

export class UpdatePostDto extends PartialType(PostFieldsDto) {}
```

`PartialType()` 有多個同名版本（`@nestjs/mapped-types`、`@nestjs/graphql`、`@nestjs/swagger`）。Swagger 情境一定要用 `@nestjs/swagger` 的那個，只有它會處理 OpenAPI metadata。

### 三層資訊，各自負責不同的事

| 層次             | 誰在讀                       | 本題中的作用                                                      | 限制                                                                           |
| ---------------- | ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| TypeScript type  | `tsc`、編輯器                | 在編譯階段檢查 `string`、`number[]`、interface、optional property | 編譯成 JavaScript 後多數型別資訊會消失（interface 全消失，array 只剩 `Array`） |
| Runtime metadata | NestJS／decorator            | 讓 decorator 在執行時取得有限的 class 與 property 資訊            | interface 不存在，array 元素型別不存在，`Partial<T>` 只剩 `Object`             |
| OpenAPI schema   | Swagger UI（含它的前端驗證） | 描述 API 使用者看到的 contract                                    | 必須由 Swagger decorators、Swagger plugin 或明確 raw schema 提供               |

三個坑的共同根因是同一件事：**沒有人負責把上一層的資訊帶到下一層。** 問題一是沒登記、問題二是沒有東西可以登記、問題三是登記在拿不到的地方。

> Swagger 文件不會讀心：TypeScript 寫過什麼，不等於 JavaScript runtime 留下了什麼，也不等於 OpenAPI 已經知道什麼。
