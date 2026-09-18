# Day 04 練習題：`useFactory` 的 `inject` 陣列寫錯，為什麼依賴全對不上？

## 目標

這一題要觀察的是 factory provider 的位置配對規則。

`inject` 不只是列出 `useFactory` 需要哪些 token。Nest 會依照陣列索引解析依賴，再把結果按照相同順序傳入 factory。它不會讀參數名稱，也不會用 TypeScript 型別猜測每個值應該放在哪裡。

主坑放在 `GET /posts/config`。程式目前啟用錯誤的 `inject` 順序，正確順序則直接留在旁邊的註解，方便切換後重新觀察結果。另外三支端點（第 5 節）各自示範一種解法，可以並排比較。

兩個依賴刻意都是 `string`。因此錯誤版可以通過型別檢查、正常啟動，直到使用設定時才看見值已經交換。

## 1. 啟動練習

```bash
npx nest start day-04-use-factory-inject
```

呼叫端點：

```bash
curl http://localhost:3000/posts/config
```

```json
{
  "apiBaseUrl": "YUN",
  "defaultAuthor": "https://posts.example.test"
}
```

## 2. 找出錯位的位置

Module 先用字串 token 註冊兩個原始設定：

```typescript
providers: [
  // 練習中使用固定值，方便專注觀察 inject 與 factory 參數的順序關係。
  {
    provide: 'POST_API_BASE_URL',
    useValue: 'https://posts.example.test',
  },
  {
    provide: 'DEFAULT_AUTHOR',
    useValue: 'YUN',
  },
];
```

`PostConfig` 放在獨立的 `src/post-config.interface.ts`，只負責描述 factory 的輸出形狀：

```typescript
export interface PostConfig {
  apiBaseUrl: string;
  defaultAuthor: string;
}
```

factory provider 直接放在 Module。factory 期待的參數順序是 `apiBaseUrl`、`defaultAuthor`，目前啟用的 `inject` 卻反過來排列；正確順序留在下一行註解：

```typescript
{
  provide: 'POST_CONFIG',
  inject: ['DEFAULT_AUTHOR', 'POST_API_BASE_URL'],
  // 正確順序：inject: ['POST_API_BASE_URL', 'DEFAULT_AUTHOR'],
  useFactory: (
    apiBaseUrl: string,
    defaultAuthor: string,
  ): PostConfig => ({
    apiBaseUrl,
    defaultAuthor,
  }),
}
```

Nest 實際執行的對應關係如下：

| 索引 | `inject` 解析出的值             | 接收它的 factory 參數 |
| ---- | ------------------------------- | --------------------- |
| 0    | `'DEFAULT_AUTHOR'` → `"YUN"`    | `apiBaseUrl`          |
| 1    | `'POST_API_BASE_URL'` → API URL | `defaultAuthor`       |

概念上等同於：

```typescript
useFactory('YUN', 'https://posts.example.test');
```

參數名稱只提供給人閱讀，編譯後也不會成為 Nest 的配對依據。兩個參數又同樣是 `string`，所以 TypeScript 也無法指出順序不合理。

## 3. 動手修正

打開 `src/day-04-use-factory-inject.module.ts`，只調整錯誤 provider 的 `inject` 順序：

```typescript
inject: ['POST_API_BASE_URL', 'DEFAULT_AUTHOR'],
```

重新啟動後，`/posts/config` 的兩個設定值就會回到正確位置：

```json
{
  "apiBaseUrl": "https://posts.example.test",
  "defaultAuthor": "YUN"
}
```

練習完成後若保留修正，請同步把 provider 測試與 e2e 測試的期待值改成正確結果；repository 初始測試刻意鎖定錯位現象，讓這個坑可以穩定重現。

## 4. 哪些改法不會有效？

- **只改 factory 參數名稱**：Nest 不會依名稱配對。
- **替參數補上更明確的 TypeScript 名稱或註解**：型別在 runtime 不負責這組位置映射；而且本例兩者都是 `string`。
- **調整 providers 陣列的宣告順序**：這只改變 provider metadata 的排列，不會改寫 `inject` 陣列內的索引。

本練習直接使用字串 token，是為了讓焦點留在 `inject` 的順序。字串必須在 `provide`、`inject` 與 `@Inject()` 中完全一致；拼錯時不會得到 TypeScript 提示。較大的正式專案通常會把 token 抽成共用常數，或使用 `Symbol`，以降低拼字錯誤與名稱碰撞的風險。

如果依賴是不同 class，錯位後可能很快因呼叫不存在的方法而拋出 `TypeError`；相同 primitive 或形狀相近的物件則可能像本例一樣安靜地帶著錯誤資料繼續執行，通常更難追查。

## 5. 四種解法並排比較

除了主坑那支端點，本練習另外保留四支端點，各自示範文章排雷指南的一種解法。**後四支的回傳完全相同**，差別只在「要做多少事才能把它弄壞」，以及「弄壞之後多快會被發現」。

| 端點 | 對應解法 | 回傳 |
| --- | --- | --- |
| `GET /posts/config` | 主坑：`inject` 順序錯位 | 值對調 |
| `GET /posts/config/aligned` | 解法一：對齊 `inject` 順序 | 正確 |
| `GET /posts/config/object` | 解法二：聚合成單一物件 | 正確 |
| `GET /posts/config/class` | 解法三：class-based provider | 正確 |
| `GET /posts/config/validated` | 解法四：邊界 validation | 正確 |

```bash
for path in "" /aligned /object /class /validated; do
  echo "GET /posts/config$path"
  curl -s "http://localhost:3000/posts/config$path"
  echo
done
```

### 給讀者的任務：試著把每一個版本弄壞

這一節的任務不是「修好它」，而是反過來——**在每個正確的版本裡，想辦法製造出「值對調」這個結果**。

1. `/aligned`：把 `inject: ['POST_API_BASE_URL', 'DEFAULT_AUTHOR']` 兩個元素互換。
2. `/object`：把 `useFactory` 裡的 `source.apiBaseUrl` 與 `source.defaultAuthor` 互換。
3. `/class`：把 `PostConfigService` 建構子的兩個參數上下對調。
4. `/validated`：把它的 `inject: ['POST_API_BASE_URL', 'DEFAULT_AUTHOR']` 兩個 token 互換。

> ⚠️ 第 4 項要動的是 `inject` 陣列，不是 `parse({ apiBaseUrl, defaultAuthor })` 那兩行。
> 那是 shorthand property，key 由變數名稱決定、與行的位置無關，對調它們不會有任何效果。

觀察四者的差異：

| 版本 | 要弄壞它需要做什麼 | 弄壞之後會怎樣 |
| --- | --- | --- |
| 解法一 | 改陣列順序 | 安靜地回傳錯值 |
| 解法二 | 動到具名欄位 | 安靜地回傳錯值，但 diff 看得出來 |
| 解法三 | **改不壞** | — |
| 解法四 | 改陣列順序 | **應用啟動失敗** |

三個值得帶走的觀察：

- **解法一改陣列順序就壞了**，而且改完之後程式看起來一樣合理——這正是主坑會發生的原因。
- **解法三改不壞。** 因為 `@Inject()` 是寫在參數身上的，參數移動時 token 跟著一起移動，兩者永遠對齊。
- **解法四一樣改陣列順序就壞，但它壞得最大聲。** `apiBaseUrl` 拿到 `'YUN'` 過不了 URL 驗證，應用會在建立 provider 時直接拋錯，連啟動都啟動不了：

  ```text
  ZodError: [
    {
      "code": "invalid_format",
      "format": "url",
      "path": ["apiBaseUrl"],
      "message": "Invalid URL"
    }
  ]
  ```

  但請注意它的限制：schema 只擋得住「錯位後違反格式規則」的情況。本練習刻意讓兩個欄位的規則不同（URL vs 非空字串）才示範得出效果；**如果兩個欄位的驗證規則完全一樣，錯位一樣會過關。**

把這三點放在一起看，就是這一節最值得帶走的體驗：**有些錯誤可以靠細心避免，有些錯誤可以靠結構讓它不存在，有些則是讓它壞得夠早、夠大聲。**

## 6. 驗證指令

```bash
npx nest build day-04-use-factory-inject
npx jest --runInBand apps/day-04-use-factory-inject/src
npx jest --config apps/day-04-use-factory-inject/test/jest-e2e.json --runInBand
```

> `inject` 是 factory 的 positional argument list。讀到第幾個 token，就會傳進第幾個參數；順序本身就是契約。
