# Day 25 練習題：Response DTO 加了 `@Exclude()`，為什麼 Profile API 還是洩漏密碼？

## 1. 題目背景

個人 Profile API 除了使用者資料，還要回傳文章數量。本題使用真正的 SQLite in-memory database：應用程式啟動時先寫入示範資料，再由 Repository 查詢。

```typescript
async onModuleInit(): Promise<void> {
  await this.usersRepository.insert([/* 兩位使用者 */]);
  await this.postsRepository.insert([/* 三篇文章 */]);
}
```

`getProfileData()` 接收 Controller 從 route parameter 解析出的 ID，查出對應的 `User` entity，再透過另一個 Repository 計算他的文章數量：

```typescript
async getProfileData(userId: number): Promise<UserProfileData> {
  const user = await this.usersRepository.findOneByOrFail({ id: userId });
  const postCount = await this.postsRepository.countBy({
    authorId: user.id,
  });

  return { ...user, postCount };
}
```

Response DTO 已經替敏感欄位加上 `@Exclude()`：

```typescript
export class UserProfileResponseDto {
  id: number;
  email: string;
  postCount: number;

  @Exclude({ toPlainOnly: true })
  passwordHash: string;
}
```

Controller 也啟用了 `ClassSerializerInterceptor`，並且宣告回傳 `UserProfileResponseDto`：

```typescript
@Get(':id/profile/broken')
getBrokenProfile(
  @Param('id', ParseIntPipe) id: number,
): Promise<UserProfileResponseDto> {
  return this.usersService.getProfileData(id);
}
```

程式可以編譯，Profile 也正確包含 `postCount`，但 `passwordHash` 同時被送給 client。

本題要釐清的主坑是：

> Repository 查回的 `User` 原本是 entity instance，但 `{ ...user, postCount }` 會建立 plain object。TypeScript 回傳型別不會在 runtime 建立 DTO instance，因此 `ClassSerializerInterceptor` 無法套用 DTO 上的 `@Exclude()`。

## 2. 資料庫與初始資料

本題使用：

```typescript
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  entities: [User, Post],
  synchronize: true,
})
```

SQLite 仍是真正的資料庫與 SQL 查詢，只是資料只存在記憶體中。每次應用程式啟動都會建立空白 database，因此 `onModuleInit()` 可以直接插入：

- 兩位使用者；
- 兩篇屬於主要使用者的文章；
- 一篇屬於另一位使用者的文章。

所以主要使用者的 `postCount` 應為 `2`。

這種啟動時 seed 適合隔離的練習專案。正式或持久化資料庫應改用 migration、獨立 seed command，或至少先判斷資料是否存在，避免重複插入。

## 3. 啟動與重現

```bash
npx nest start day-25-exclude-plain-object
```

依序呼叫錯誤版與修正版：

```bash
curl -s http://localhost:3000/users/1/profile/broken
curl -s http://localhost:3000/users/1/profile/fixed
```

也可以直接執行測試：

```bash
npx jest apps/day-25-exclude-plain-object/src --runInBand
npx jest --config apps/day-25-exclude-plain-object/test/jest-e2e.json --runInBand
```

## 4. 預期結果

錯誤版雖然宣告回傳 `UserProfileResponseDto`，實際回傳的仍是 plain object：

```json
{
  "id": 1,
  "email": "reader@example.com",
  "passwordHash": "$2b$10$demo-password-hash",
  "postCount": 2
}
```

修正版使用 `plainToInstance()` 建立真正的 DTO instance：

```json
{
  "id": 1,
  "email": "reader@example.com",
  "postCount": 2
}
```

| Endpoint                | Runtime 回傳值                    | `passwordHash` |
| ----------------------- | --------------------------------- | -------------- |
| `/users/1/profile/broken` | plain object                      | 外洩           |
| `/users/1/profile/fixed`  | `UserProfileResponseDto` instance | 排除           |

## 5. 修正方式

```typescript
// users.service.ts
async getProfile(userId: number): Promise<UserProfileResponseDto> {
  const profileData = await this.getProfileData(userId);

  return plainToInstance(UserProfileResponseDto, profileData);
}

// users.controller.ts
@Get(':id/profile/fixed')
getFixedProfile(
  @Param('id', ParseIntPipe) id: number,
): Promise<UserProfileResponseDto> {
  return this.usersService.getProfile(id);
}
```

Service 透過 `plainToInstance()` 建立真正的 `UserProfileResponseDto`，Controller 只負責把結果交給 NestJS。`ClassSerializerInterceptor` 隨後執行 class-to-plain 轉換，便能讀取並套用 `@Exclude()`。

NestJS 11 也可以使用 `@SerializeOptions({ type: UserProfileResponseDto })`，讓 Interceptor 先把 plain response 轉成指定類別。本練習保留 `plainToInstance()`，讓 instance 的建立時機更容易觀察。

## 6. 給讀者的任務

1. 確認 `onModuleInit()` 真的透過 Repository 寫入 Users 與 Posts。
2. 分別傳入 ID 1 與 ID 2，確認 `getProfileData()` 會查詢指定使用者並計算各自的文章數量。
3. 呼叫兩支 Profile endpoint，比較 response body。
4. 驗證 Repository 查回的是 `User` entity，但組合後不是 `UserProfileResponseDto` instance。
5. 說明 TypeScript 回傳型別為什麼無法在 runtime 啟用 decorator。
6. 在 Service 使用 `plainToInstance()` 修正 response，並補上敏感欄位的負向斷言。

## 7. 提示

- `@Exclude()` 是 class-transformer 的轉換 metadata，不是欄位層級的自動遮罩。
- Repository 查回的 `User` 是 entity instance，但 `{ ...user, postCount }` 會建立新的 plain object。
- `as UserProfileResponseDto` 只改變編譯器的判斷，不會改變 runtime prototype。
- Prisma record、raw query、`JSON.parse()` 後的快取資料也常是 plain object。

## 8. 驗收句

完成練習後，應能說出：

> Repository 回傳 Entity，不代表後續組成的 response 仍是 class instance。回傳型別也不會自動建立 DTO；必須明確完成 plain-to-instance 轉換，`@Exclude()` 才有套用的對象。

## 參考資料

- [NestJS Serialization](https://docs.nestjs.com/techniques/serialization)
- [NestJS SQL / TypeORM](https://docs.nestjs.com/techniques/database)
- [class-transformer](https://github.com/typestack/class-transformer)
- [TypeORM Repository APIs](https://typeorm.io/repository-api)
