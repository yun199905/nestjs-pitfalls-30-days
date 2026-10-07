# Day 22 練習題：JOIN 分頁到底在算 Row 還是 Entity？

## 目標

比較 TypeORM QueryBuilder 在一對多 JOIN 下使用 `limit/offset` 與 `take/skip` 的差異，並分清楚三個容易混淆的數字：

- JOIN 後的 SQL Row 數量。
- 去重後的 User Entity 數量。
- 當頁實際回傳的 Entity 數量。

本練習使用 TypeORM 0.3.31 與 SQLite。Query logging 已經開啟，可以直接觀察兩種分頁方式產生的 SQL。

## 1. 啟動練習

```bash
npx nest start day-22-typeorm-relation-pagination --watch
```

應用程式啟動時會建立三位 User：

| User   | Post 數量 |
| ------ | --------: |
| User 1 |         3 |
| User 2 |         2 |
| User 3 |         0 |

三位 User JOIN Posts 後共有六個 Rows：有 Posts 的 User 每篇 Post 形成一列；User 3 因為使用 `LEFT JOIN`，即使沒有 Post 仍保留一列。

## 2. 觀察 `limit/offset` 切割 JOIN Rows

查詢第一頁，每頁指定兩筆：

```bash
curl 'http://localhost:3000/users/limit-offset?page=1&pageSize=2'
```

核心查詢是：

```ts
this.usersRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .limit(2)
  .offset(0)
  .getManyAndCount();
```

SQL 的 `LIMIT 2` 先取得 JOIN 結果的前兩列，兩列都屬於 User 1。TypeORM 之後才把相同主鍵的 Rows hydrate 成 Entity，因此回應只有一位 User，而且只載入兩篇 Posts：

```json
{
  "data": [
    {
      "id": 1,
      "name": "User 1",
      "posts": [
        { "id": 1, "title": "User 1 的第 1 篇文章" },
        { "id": 2, "title": "User 1 的第 2 篇文章" }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 2,
    "currentPageCount": 1,
    "totalCount": 3
  }
}
```

回應不另外提供 `totalPages`；它可由可信的 `totalCount` 與 `pageSize` 推導，而錯誤的 `totalCount` 也只會產生錯誤的衍生頁數。

再查第二頁：

```bash
curl 'http://localhost:3000/users/limit-offset?page=2&pageSize=2'
```

第二頁會再次出現 User 1，只帶著上一頁沒有載入的第三篇 Post；後面的 User 2 也只載入第一篇 Post。這證明分頁邊界切進了同一個 User 展開後的 Rows。

## 3. 改用 `take/skip` 表達 Entity Pagination

查詢相同的第一頁：

```bash
curl 'http://localhost:3000/users/take-skip?page=1&pageSize=2'
```

這次仍然使用相同的 QueryBuilder、JOIN 與回傳方法，只把分頁 API 改成：

```ts
this.usersRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .take(2)
  .skip(0)
  .getManyAndCount();
```

在 TypeORM 0.3.31 中，這會分成三個階段：

1. 從 JOIN 結果以 `DISTINCT` 取得當頁的 User ID。
2. 依照這批 ID 查回完整 User 與 Posts。
3. 使用 `COUNT(DISTINCT user.id)` 計算所有符合條件的 User。

第一頁會得到 User 1、User 2，分別帶回完整的 3、2 篇 Posts；第二頁則只會得到沒有 Post 的 User 3：

```bash
curl 'http://localhost:3000/users/take-skip?page=2&pageSize=2'
```

這兩個主範例刻意沒有指定 ORDER，目的是隔離分頁 API 這個變因。TypeORM 0.3.31 在 distinct ID 查詢沒有排序條件時，會自動以 User 主鍵升冪作為 fallback ordering；這是目前版本的內部行為，不代表正式分頁可以省略穩定排序。

## 4. 驗證 Row Count 與 Entity Count

呼叫 count 對照端點：

```bash
curl 'http://localhost:3000/users/counts'
```

回應為：

```json
{
  "joinRowCount": 6,
  "distinctUserCount": 3
}
```

兩個數字都正確，只是計算單位不同：

```sql
-- JOIN 後共有幾個 Rows
SELECT COUNT(*)
FROM user
LEFT JOIN post ON post.authorId = user.id;
```

```sql
-- JOIN 結果中共有幾位不重複的 Users
SELECT COUNT(DISTINCT user.id)
FROM user
LEFT JOIN post ON post.authorId = user.id;
```

`getManyAndCount()` 的 total 是所有符合條件的主 Entities，不受當頁 `take/skip` 或 `limit/offset` 限制。當頁真正回傳幾筆則看 `data.length`，也就是本例的 `currentPageCount`；`totalCount` 則表示所有符合條件的主 Entities。

## 5. 延伸陷阱一：Relation ORDER BY 破壞 DISTINCT 分頁

依 Post ID 由新到舊排列 User：

```bash
curl 'http://localhost:3000/users/order-by-relation?page=1&pageSize=2'
curl 'http://localhost:3000/users/order-by-relation?page=2&pageSize=2'
curl 'http://localhost:3000/users/order-by-relation?page=3&pageSize=2'
```

端點使用：

```ts
this.usersRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .orderBy('post.id', 'DESC')
  .take(2)
  .skip(skip)
  .getManyAndCount();
```

三頁會依序得到：

```text
Page 1 → [User 2]         total = 1
Page 2 → [User 1]         total = 3
Page 3 → [User 1, User 3] total = 3
```

TypeORM 為了依 relation 欄位排序，distinct query 必須同時選出 `user_id` 與 `post_id`。同一位 User 的不同 Posts 因此仍是不同組合，會占用多個分頁位置。當 hydration 後的 Entity 數量少於 `take`，目前版本還可能用 `skip + data.length` 推算 total，造成 total 隨頁碼改變。

這也讓 `getManyAndCount()` 的 total 和獨立執行的 `getCount()` 失去一致性：本例真正的 distinct User count 是 3，第一頁卻回傳 `totalCount = 1`。

TypeORM [issue #11744](https://github.com/typeorm/typeorm/issues/11744) 將這個行為記錄為 0.3.26+ 的 regression：QueryBuilder 同時使用 JOIN、relation ordering、`take` 與 `getManyAndCount()` 時，可能發生 page truncation 與 inaccurate count。本例以 User 2 的兩篇 Posts 和 User 3 的零篇 Posts 保留 issue 描述的資料形狀；零 relation 不是 bug 的直接原因，真正的問題仍是 JOIN Row 膨脹、relation ordering、pagination 與 hydration/count shortcut 的交互作用。

## 6. 延伸陷阱二：GROUP BY 正確，Count 卻錯了

查詢至少有兩篇 Posts 的 Users：

```bash
curl 'http://localhost:3000/users/group-by-post-count?page=1&pageSize=2'
```

資料查詢包含：

```ts
.addSelect('COUNT(post.id)', 'postCount')
.groupBy('user.id')
.having('COUNT(post.id) >= :minimumPostCount', {
  minimumPostCount: 2,
})
.take(2)
.skip(0)
.getManyAndCount();
```

User 1、User 2 各有至少兩篇 Posts，因此 `data` 正確包含兩位 Users；但 `getManyAndCount()` 產生 count query 時移除了 GROUP BY，只留下作用於整份 JOIN 結果的 HAVING，total 因而錯報為 3，而不是 2。

TypeORM [issue #5127](https://github.com/typeorm/typeorm/issues/5127) 記錄了相同根因：Entity Query 保留 GROUP BY/HAVING，但 `getManyAndCount()` 產生的 Count Query 移除了 GROUP BY，導致 data 與 total 使用不同的聚合語意。原 issue 使用 TypeORM 0.2.14／PostgreSQL，目前狀態為 closed as not planned；本例則使用 TypeORM 0.3.31／SQLite，版本、driver 與聚合函式不同，但 GROUP BY 被 Count Query 移除的行為一致。

這類查詢不應直接信任 `getManyAndCount()`；應把資料查詢和符合相同聚合條件的自訂 count 分開執行。

## 7. 排雷提醒

- 正式分頁仍須穩定排序；若主要排序值可能重複，應以唯一主鍵作為最後的 tie-breaker。
- Relation 排序應先轉成主 Entity 的單一排序值，例如 `MAX(post.createdAt)`，再分頁 User ID。
- `GROUP BY/HAVING` 查詢應分開執行 data 與 count，並對兩條 SQL 各自做整合測試。
- `GROUP BY`、`DISTINCT` 不是可以任意追加的修補；複雜情境優先採用先查主鍵、後載入 relations 的兩階段策略。

## 8. 執行測試

```bash
npx jest --config apps/day-22-typeorm-relation-pagination/test/jest-e2e.json --runInBand
```

測試會驗證：

- `limit/offset` 第一頁少筆、Posts 被截斷，第二頁 User 1 重複。
- `take/skip` 第一頁有兩位 Users、第二頁有一位，Posts 都完整。
- 兩種基本分頁查詢的 `totalCount` 都是 3。
- JOIN Row Count 為 6，distinct User Count 為 3。
- Relation ORDER BY 造成 User 1 跨頁重複，第一頁錯報 total 1，後兩頁為 3。
- GROUP BY 資料查詢回傳 User 1、2，但 `getManyAndCount()` 錯報 total 3。
- `page`、`pageSize` 只接受正整數。

## 總結

`limit/offset` 與 `take/skip` 在沒有 JOIN 時可能產生相似結果，但遇到一對多 JOIN 後，它們表達的分頁層次不同。

> JOIN 後使用分頁前，先確認限制的是 SQL Rows，還是主 Entities。
