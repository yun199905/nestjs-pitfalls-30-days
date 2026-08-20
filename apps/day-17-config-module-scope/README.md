# Day 17 練習題：ConfigService 注入不到

## 目標

重現「`ConfigModule` 明明註冊了，`forRootAsync` 裡的 `inject: [ConfigService]` 卻找不到它」的啟動錯誤。過程中會先動手驗證一個看起來很合理、實際上完全沒用的猜測——調整 `imports` 陣列的順序——再用兩種解法修好，並比較 `isGlobal` 與顯式 `imports` 的差別。

這一題的錯誤發生在**啟動階段**，應用程式根本起不來，所以不像前幾天可以打不同端點比對結果，而是靠切換註解、重啟、看錯誤訊息來觀察。

## 步驟指示

### 0. 準備 .env

```bash
cp .env.example .env
```

`.env` 要放在 **repo 根目錄**，不是放在 `apps/day-17-config-module-scope/` 底下。因為 `@nestjs/config` 預設讀取 `process.cwd()/.env`，而 `nest start <project>` 的 cwd 是 repo 根目錄。

### 1. 觀察坑點（目前狀態）

```bash
npx nest start day-17-config-module-scope
```

應用程式起不來，終端機會印出：

```text
UnknownDependenciesException [Error]: Nest can't resolve dependencies of the
TypeOrmModuleOptions (?). Please make sure that the argument ConfigService at
index [0] is available in the TypeOrmCoreModule module.
```

打開 `src/day-17-config-module-scope.module.ts`，可以看到 `TypeOrmModule.forRootAsync()` 裡確實寫了 `inject: [ConfigService]`，而 `ConfigModule.forRoot()` 也確實在同一個 `imports` 陣列裡註冊了。

先注意錯誤訊息挑明的地方：它說的不是「找不到 ConfigService」，而是「**在 `TypeOrmCoreModule` 這個模組裡**找不到」。`TypeOrmCoreModule` 是 `forRootAsync()` 動態產生出來的模組，有自己的作用域。

### 2. 驗證那個「看起來很合理」的猜測

看到 `ConfigModule.forRoot()` 被放在 `imports` 陣列的**最後一個**，幾乎每個人的第一直覺都是：是不是它還沒準備好，前面的 `TypeOrmModule` 就先跑了？

動手驗證這個猜測。把 `ConfigModule.forRoot({ ... })` 整段剪下，貼到 `imports` 陣列的**第一個**位置，重新啟動：

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({}),
    TypeOrmModule.forRootAsync({
      // imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ ... }),
    }),
  ],
})
```

錯誤訊息**一字不差**：

```text
Nest can't resolve dependencies of the TypeOrmModuleOptions (?). Please make
sure that the argument ConfigService at index [0] is available in the
TypeOrmCoreModule module.
```

順序不是變數。先把這條路關掉，才不會一直往錯的方向修。

驗證完請把順序**改回原樣**（`ConfigModule.forRoot()` 放回最後），後面的步驟才對得上。

### 3. 動手修復（解法一：把作用域補齊）

回頭看錯誤訊息自己給的提示：

```text
- If ConfigService is exported from a separate @Module, is that module imported
  within TypeOrmCoreModule?
```

照做。打開 `src/day-17-config-module-scope.module.ts`，把 `forRootAsync` 裡的這行取消註解：

```typescript
imports: [ConfigModule],
```

重新啟動，應用程式順利起來了。

這一行做的事情是：把 `ConfigModule` 引進**那個動態模組自己的作用域**，`inject` 才看得到 `ConfigService`。

### 4. 動手修復（解法二：`isGlobal`）

把步驟 3 改的那行改回註解，然後只取消註解 `ConfigModule.forRoot()` 裡的這行：

```typescript
isGlobal: true,
```

重新啟動，一樣順利起來。

`isGlobal: true` 是把 `ConfigService` 註冊進全域容器，任何模組都看得到，動態模組也不例外——所以它不需要動到 `forRootAsync` 那邊。

比較一下：解法一改的是「使用者那一端」，只補齊真正需要的那個作用域；解法二改的是「提供者那一端」，一次讓全部模組都看得到。精準與方便的取捨，文章裡有更完整的討論。

### 5. 測試驗證

在修好的狀態下（解法一或解法二皆可）：

```bash
npx jest --config apps/day-17-config-module-scope/test/jest-e2e.json
```

這支測試會確認 `DataSource` 真的建立起來，而且 `database` 就是 `.env` 裡設定的值——也就是 `useFactory` 確實拿到了 `ConfigService`。

> 這支測試在**起始（壞掉的）狀態下會失敗**，因為模組根本編不起來，`compile()` 會直接拋出 `UnknownDependenciesException`。這是刻意設計的：它就是「有沒有修好」的判定條件。測試本身不依賴 `.env` 是否存在。

### 6. 還原

實驗完請把 `src/day-17-config-module-scope.module.ts` 改回**起始狀態**（`isGlobal` 與 `imports` 兩行都維持註解），這樣下次打開才踩得到坑。
