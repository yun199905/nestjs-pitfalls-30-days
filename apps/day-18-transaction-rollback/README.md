# Day 18 練習題：SQLite 測試通過，transaction 就真的寫對了嗎？

## 目標

重現「在 `transaction()` 裡呼叫另一個 service，但該 service 使用預設 Repository，導致寫入不一定屬於同一個 transaction」的問題，並觀察資料庫連線模型如何影響結果：

- SQLite 共用 QueryRunner，可能讓錯誤程式看似正確。
- PostgreSQL 使用連線池，會暴露交易外的寫入。
- 正確做法是傳遞 `EntityManager`，或統一使用 `queryRunner.manager`。
- 手動建立 QueryRunner 時，最後必須呼叫 `release()`。

這一題最重要的判斷是：

> transaction 保護的是同一個 manager 所在的連線，不是 callback 的大括號。

## 資料庫切換方式

兩組設定都放在 `src/day-18-transaction-rollback.module.ts`，但任一時間只能啟用一組。

專案預設註解 SQLite、啟用 PostgreSQL：

```typescript
// SQLite
/*
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
}),
*/

// PostgreSQL
TypeOrmModule.forRoot({
  type: 'postgres',
  // ...
}),
```

切換資料庫後必須重新啟動 NestJS。不要同時取消兩組設定的註解，否則兩個未命名的預設 DataSource 會發生衝突。

## 1. 先用 SQLite：錯誤被掩蓋

先取消 SQLite 設定的註解，並將完整的 PostgreSQL `forRoot()` 包進區塊註解：

```typescript
// SQLite
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
}),

// PostgreSQL
/*
TypeOrmModule.forRoot({
  type: 'postgres',
  // ...
}),
*/
```

SQLite 使用記憶體資料庫，不需要啟動 Docker：

```bash
npx nest start day-18-transaction-rollback
```

應用程式啟動時會建立作者 YUN，初始 `postCount` 是 0：

```bash
curl http://localhost:3000/users
```

```json
[{ "id": 1, "name": "YUN", "postCount": 0 }]
```

執行錯誤版本：

```bash
curl -X POST http://localhost:3000/posts/broken-boundary
curl http://localhost:3000/users
```

發文請求會回傳 500，但 YUN 的 `postCount` 仍是 0，Post 也是 0 筆。只看結果，這段 transaction 好像沒有問題。

錯誤程式其實漏傳了 callback 提供的 manager：

```typescript
await this.dataSource.transaction(async (manager) => {
  await this.usersService.incrementPostCount(author.id);

  await manager.save(Post, {
    title: '第一篇文章',
    author: { id: author.id },
  });

  throw new Error('模擬發文後續流程失敗');
});
```

TypeORM 的 SQLite driver 在同一個 DataSource 內重用 QueryRunner，因此預設 Repository 的 `UPDATE` 剛好也落在已開始 transaction 的連線上，最後和 Post 一起 rollback。

這是錯誤被環境掩蓋，不代表 manager 使用正確。

## 2. 切到 PostgreSQL：交易邊界才現形

停止 NestJS，將模組恢復成 SQLite 註解、PostgreSQL 啟用，再啟動資料庫：

```bash
cd apps/day-18-transaction-rollback
docker compose up -d
cd ../..
npx nest start day-18-transaction-rollback
```

執行完全相同的錯誤版本：

```bash
curl -X POST http://localhost:3000/posts/broken-boundary
curl http://localhost:3000/users
```

這次 Post 仍是 0 筆，但 YUN 的計數變成：

```json
[{ "id": 1, "name": "YUN", "postCount": 1 }]
```

`incrementPostCount()` 的 manager 是選填參數。漏傳時，它會退回注入的預設 Repository：

```typescript
async incrementPostCount(userId: number, manager?: EntityManager) {
  const repository = manager
    ? manager.getRepository(User)
    : this.usersRepository;

  await repository.increment({ id: userId }, 'postCount', 1);
}
```

PostgreSQL 的外層 transaction 使用連線 A；預設 Repository 可以從 pool 取得連線 B。連線 B 的 `UPDATE` 已自動提交，因此連線 A 的 `ROLLBACK` 只能撤銷 Post。

SQL log 可能仍然依序顯示：

```text
query: START TRANSACTION
query: UPDATE "user" SET "postCount" = "postCount" + 1 WHERE "id" = $1
query: INSERT INTO "post" ...
query: ROLLBACK
```

TypeORM logger 沒有標示連線身分。`UPDATE` 排在 `START TRANSACTION` 與 `ROLLBACK` 中間，只代表執行時間位於兩者之間，不能證明它們使用同一條連線。

## 3. 解法一：把 EntityManager 傳下去

```bash
curl -X DELETE http://localhost:3000/posts/demo-data
curl -X POST http://localhost:3000/posts/pass-manager
curl http://localhost:3000/users
```

修正版將 callback 收到的 manager 傳進 `UsersService`：

```typescript
await this.usersService.incrementPostCount(author.id, manager);
```

`incrementPostCount()` 便會改用 transaction 專用的 Repository：

```typescript
const repository = manager ? manager.getRepository(User) : this.usersRepository;
```

計數與 Post 現在使用同一個 manager，因此固定錯誤發生後，兩者會一起回滾，`postCount` 維持 0。

選填 manager 方便一般流程與 transaction 流程共用方法，但 transaction 內的呼叫端必須承擔漏傳風險。

## 4. 解法二：手動管理 QueryRunner

```bash
curl -X DELETE http://localhost:3000/posts/demo-data
curl -X POST http://localhost:3000/posts/query-runner
curl http://localhost:3000/users
```

QueryRunner 版本將 transaction 生命週期明確寫出來，所有資料庫操作都使用 `queryRunner.manager`：

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  await this.usersService.incrementPostCount(author.id, queryRunner.manager);

  await queryRunner.manager.save(Post, {
    title: '第一篇文章',
    author: { id: author.id },
  });

  throw new Error('模擬發文後續流程失敗');
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

結果同樣是 Post 0 筆、`postCount` 0。QueryRunner 只提供更細緻的生命週期控制，仍不能混用預設 Repository。

## 5. PostgreSQL 延伸陷阱：忘記 release()

這個實驗依賴 PostgreSQL 連線池，不適用 SQLite。

`publishLeakyQueryRunner()` 故意省略：

```typescript
finally {
  await queryRunner.release();
}
```

本練習將 PostgreSQL pool 上限設為 2。連續呼叫：

```bash
curl -X POST http://localhost:3000/posts/leaky-query-runner
curl -X POST http://localhost:3000/posts/leaky-query-runner
curl -X POST http://localhost:3000/posts/leaky-query-runner
```

前兩次各占住一條連線，第三次會等待可用連線。`rollbackTransaction()` 只撤銷資料，不會將 QueryRunner 持有的連線歸還 pool。

> 這是選做的手動實驗，不放進自動化測試，避免 Jest 因等待連線而卡住。

## 6. 測試驗證

e2e 會根據實際使用的 driver 判斷錯誤版本預期值，因此切換註解後可以執行同一組測試：

```bash
npx jest --config apps/day-18-transaction-rollback/test/jest-e2e.json --runInBand
```

預期結果：

| 版本               | SQLite                | PostgreSQL            |
| ------------------ | --------------------- | --------------------- |
| 漏傳 manager       | Post 0、`postCount` 0 | Post 0、`postCount` 1 |
| 傳遞 EntityManager | Post 0、`postCount` 0 | Post 0、`postCount` 0 |
| QueryRunner        | Post 0、`postCount` 0 | Post 0、`postCount` 0 |

SQLite 測試不需要 Docker；PostgreSQL 測試前必須先執行 `docker compose up -d`。完成 SQLite 驗證後，請將模組恢復成預設的 PostgreSQL 設定。

## 7. 收尾

```bash
cd apps/day-18-transaction-rollback
docker compose down -v
```
