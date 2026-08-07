# Day 13 練習題：遺失的實體

## 目標
重現「TypeORM 執行 Repository 查詢時找不到 Entity，導致 `EntityMetadataNotFoundError`」的錯誤，並使用 NestJS 提供的 `autoLoadEntities` 修復。

## 步驟指示

### 1. 觀察坑點 (目前狀態)
1. 根模組已透過 `TypeOrmModule.forRoot()` 建立 SQLite in-memory 連線，並匯入獨立的 `UsersModule`。
2. `UsersModule` 使用 `TypeOrmModule.forFeature([User])` 註冊 Repository，並由 `UsersController`、`UsersService` 負責 `GET /users` 查詢。
3. 啟動專案後，向 `GET /users` 發送請求。應用程式本身可以啟動，直到 Repository 真正查詢資料時才會觸發錯誤。
4. 你會在伺服器 Log 中看到以下錯誤：
   ```text
   EntityMetadataNotFoundError: No metadata for "User" was found.
   ```
5. 發生原因在於：主要連線 (`forRoot`) 雖然建立了，卻沒有把 `User` 加入 TypeORM 的 Entity Metadata。`forFeature([User])` 會在 `UsersModule` 註冊 Repository provider，但只有開啟 `autoLoadEntities` 時，NestJS 才會自動把 feature module 註冊的 Entity 加入連線設定。

> 延伸地雷：如果連 `UsersModule` 裡的 `TypeOrmModule.forFeature([User])` 都忘了，Nest 會在建立 `UsersService` 時找不到 `UserRepository`，應用程式無法啟動。這是 Repository provider 沒有註冊的 DI 錯誤，和本題查詢時才出現的 `EntityMetadataNotFoundError` 不同。程式碼中的 `users.module.ts` 已在對應位置留下切換用註解。

### 2. 動手修復
請打開 `src/day-13-typeorm-entities.module.ts`：

1. 找到 `TypeOrmModule.forRoot({ ... })` 的設定區塊。
2. 在設定中補上這行屬性：
   ```typescript
   autoLoadEntities: true,
   ```
3. 儲存檔案並重新啟動應用程式。

### 3. 測試驗證
1. 再次發送請求到 `GET /users`。
2. 此時伺服器不會再報錯，因為 TypeORM 已經成功透過 `autoLoadEntities` 擷取到 `User` 的 Metadata，並會順利回傳空陣列 `[]`。

## 延伸情境：Webpack 打包後，Glob 掃描為什麼會失效？

文章的方案三（Glob 路徑自動載入）提到一個警語：如果專案經過 Webpack 等工具打包，原本分散的 `.entity.js` 檔案可能被整併進 bundle，導致 Glob 路徑找不到 Entity，進而產生 `EntityMetadataNotFoundError`。

這個 repo 的根目錄 `nest-cli.json` 本來就設定了 `"webpack": true`，所以每個 day 專案（包含 day-13）用 `nest build` 打包出來的 dist，預設就已經是 Webpack 單一 bundle。不需要額外安裝或設定 Webpack，直接照下面步驟操作就能重現這個錯誤。

### 步驟一：切換成 Glob 設定

打開 `src/day-13-typeorm-entities.module.ts`，把目前示範用的這一行註解掉：

```typescript
entities: [],
```

改成取消註解既有的 Glob 版本：

```typescript
entities: [__dirname + '/**/*.entity{.ts,.js}'],
```

### 步驟二：打包

在專案根目錄執行：

```bash
npx nest build day-13-typeorm-entities
```

### 步驟三：證明 bundle 裡沒有獨立的 entity 檔

```bash
find dist/apps/day-13-typeorm-entities -iname '*.entity*'
```

這個指令不會有任何輸出——雖然原始碼 `src/users/user.entity.ts` 確實存在，但打包後 `__dirname` 指向的 `dist/apps/day-13-typeorm-entities` 目錄下只有一支 `main.js`，`User` entity 的程式碼已經被內嵌進去，Glob 樣式自然一個檔案都比對不到。

### 步驟四：執行打包產物並觸發查詢

```bash
node dist/apps/day-13-typeorm-entities/main.js
```

另開一個終端機：

```bash
curl http://localhost:3000/users
```

預期伺服器端會印出：

```text
EntityMetadataNotFoundError: No metadata for "User" was found.
```

這與方案零（`entities: []`）看到的錯誤訊息完全相同，但成因不同：這次是因為 Glob 在打包後的目錄結構中找不到任何檔案，導致 `entities` 陣列實際上還是空的。

### 對照修法

改用 `entities: [User]`（方案一）或 `autoLoadEntities: true`（方案三）都不受打包影響：前者是編譯期就解析好的靜態 import，後者是走 NestJS 的模組依賴樹，兩者都不依賴執行期的檔案路徑。這也是為什麼在會打包的 NestJS 專案中，不建議把 Glob 掃描當作主要的 Entity 載入方式。

### 還原

測試完後，記得把 `day-13-typeorm-entities.module.ts` 改回本篇一開始示範用的 `entities: []`，避免影響前面三個步驟或既有的測試。
