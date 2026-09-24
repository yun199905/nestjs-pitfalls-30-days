# Day 9｜手動 `new` 的全域 Guard：能運作，卻不受 Nest Container 管理

## 目標

全域 Guard 通常會在 `main.ts` 裡註冊：

```typescript
app.useGlobalGuards(new RolesGuard(...));
```

路由確實都被保護了，Guard 也能正常執行，看起來沒有任何問題。但這行程式藏著一個容易忽略的邊界：`RolesGuard` 是我們自己 `new` 出來的，Nest 只是接收並使用這個現成的 instance，它並不在 DI container 的管理之下。

當 Guard 開始依賴 `Reflector`、`UserRolesService` 或其他 provider，`main.ts` 就得自己從容器取出這些依賴，再親手組裝 `RolesGuard`。即使 class 上有 `@Injectable()`，手動建立的 instance 也不會因此自動回到容器裡。

今天要處理的不是「全域 Guard 怎麼寫」，而是「全域 Guard 應該由誰建立」。我們會比較 `useGlobalGuards(new RolesGuard(...))` 與 `APP_GUARD`，看清楚為什麼後者才能讓 Guard 真正受到 Nest container 管理。

這一題從頭到尾只有**一個** `RolesGuard`，而且它不會被改動。會變的只有一件事：

> **誰負責建立這個 `RolesGuard`？是你自己 `new`，還是 Nest container？**

因為真正的問題不是 `useGlobalGuards()` 這個方法，而是你傳給它的實例是怎麼來的。三種寫法可以直接對照：

| 寫法                                   | `RolesGuard` 誰建立 | 自動注入依賴 |
| -------------------------------------- | ------------------- | ------------ |
| `useGlobalGuards(new RolesGuard(...))` | 你                  | ❌           |
| `useGlobalGuards(app.get(RolesGuard))` | 容器                | ✅           |
| `APP_GUARD` + `useClass`               | 容器                | ✅           |

## 範例結構

`RolesGuard` 的兩個依賴都是它真正需要的，不是為了示範硬塞：

```text
request
   ↓
FakeAuthenticationMiddleware      模擬認證，寫入 request.user = { id }
   ↓
RolesGuard
   ├── Reflector                  讀 @Roles() 標了什麼角色
   └── UserRolesService           查這個使用者「現在」有哪些角色
   ↓
AppController
```

角色不放進 token、改成授權當下才查，是有實務理由的：使用者被撤銷 admin 之後，不必等舊 token 過期。

範例資料固定兩個使用者：

| `x-user-id` | 角色            |
| ----------- | --------------- |
| `1`         | `user`          |
| `2`         | `user`、`admin` |

## 1. 啟動與觀察

```bash
npx nest start day-09-global-enhancer-di
```

沒有標 `@Roles()` 的路由誰都能進：

```bash
curl -i http://localhost:3000/profile -H 'x-user-id: 1'   # 200 Any authenticated user
```

標了 `@Roles(Role.Admin)` 的路由只放行 admin：

```bash
curl -i http://localhost:3000/admin -H 'x-user-id: 1'     # 403
curl -i http://localhost:3000/admin -H 'x-user-id: 2'     # 200 Admin only
```

**授權行為完全正確。** 這一題要看的不是結果，是責任歸屬。

## 2. 現在是誰在組裝 `RolesGuard`？

打開 `src/main.ts`：

```typescript
app.useGlobalGuards(
  new RolesGuard(app.get(Reflector), app.get(UserRolesService)),
);
```

`Reflector` 與 `UserRolesService` 確實都來自容器，這行也確實能動。但 `RolesGuard` 本身是 `main.ts` 用 `new` 造出來的，所以它的 constructor 要什麼、順序如何，全部由 `main.ts` 負責。

物件的所有權因此被切成兩半：

```text
Nest container
├── Reflector
└── UserRolesService

你的 main.ts
└── RolesGuard      ← dependency wiring 變成應用程式碼的責任
```

想像 `RolesGuard` 哪天要多記一筆稽核紀錄：

```typescript
constructor(
  private readonly reflector: Reflector,
  private readonly userRolesService: UserRolesService,
  private readonly auditService: AuditService,   // 新的依賴
) {}
```

`main.ts` 就得跟著改：

```typescript
new RolesGuard(
  app.get(Reflector),
  app.get(UserRolesService),
  app.get(AuditService),
);
```

一個與 `main.ts` 無關的改動，卻要求 `main.ts` 同步更新——這就是代價。

## 3. 中間版本：`app.get(RolesGuard)`

先把 `RolesGuard` 登記成 provider：

```typescript
providers: [UserRolesService, RolesGuard],
```

再改 `main.ts`：

```typescript
app.useGlobalGuards(app.get(RolesGuard));
```

這個版本**也完全正常**，而且此時 `RolesGuard`、`Reflector`、`UserRolesService` 三者都是容器建立的。

這一步值得自己動手試一次，因為它證明了：

> `useGlobalGuards()` 不是天生不能搭配 DI。不能注入的是**你自己 `new` 出來的那個實例**。

## 4. 改用 `APP_GUARD`

正解已經以註解形式寫在 `src/day-09-global-enhancer-di.module.ts`，取消註解即可：

```typescript
import { APP_GUARD } from '@nestjs/core';

@Module({
  controllers: [AppController],
  providers: [
    UserRolesService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class Day09GlobalEnhancerDiModule {}
```

記得一併刪掉 `main.ts` 的手動註冊，`main.ts` 會回到只剩啟動：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(Day09GlobalEnhancerDiModule);
  await app.listen(process.env.port ?? 3000);
}
```

現在 `RolesGuard` 完整回到容器手上：

```text
APP_GUARD
   ↓ 「我要一個 RolesGuard」
容器讀 constructor
   ↓
Reflector、UserRolesService
   ↓ 解析依賴
new RolesGuard(reflector, userRolesService)
   ↓
註冊為全域 Guard
```

`RolesGuard` 之後想加什麼依賴都可以，只要那個 provider 在這個模組看得見，`main.ts` 一個字都不必改。

## 5. 驗證

三種寫法的授權行為應該完全一致：

- `x-user-id: 2` 打 `/admin` → `200`
- `x-user-id: 1` 打 `/admin` → `403`
- `/profile` 一律 `200`

```bash
npx nest build day-09-global-enhancer-di
npx jest --config apps/day-09-global-enhancer-di/test/jest-e2e.json --runInBand
```

e2e 測試把三種寫法各跑一次同一組斷言，確認差別只在建立者，不在行為。

## 其他全域機制

相同規則也適用於其他 global enhancer，但這一題不額外實作它們：

| 全域機制    | 手動註冊方法              | DI provider token |
| ----------- | ------------------------- | ----------------- |
| Guard       | `useGlobalGuards()`       | `APP_GUARD`       |
| Pipe        | `useGlobalPipes()`        | `APP_PIPE`        |
| Interceptor | `useGlobalInterceptors()` | `APP_INTERCEPTOR` |
| Filter      | `useGlobalFilters()`      | `APP_FILTER`      |

這些 `useGlobal*()` 方法不是不能使用；若傳入的實例不需要 DI，它們可以正常工作。像 `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))` 這種只吃設定參數的寫法，一直都是官方推薦的用法。

> `useGlobal*()` 負責把某個 Guard 設為全域；它不負責建立這個 Guard。
