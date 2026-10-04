# Day 20 練習題：`save()` 背後悄悄進行的 SELECT

## 目標

比較 TypeORM 更新既有 `Post` 時，`Repository.save()` 與 `Repository.update()` 實際送出的 SQL。

這份練習只聚焦一個問題：當更新意圖已經很明確時，使用同時負責新增與更新的 `save()`，可能為每次操作多付出一次 SELECT 的成本。

## 1. 啟動練習

```bash
npx nest start day-20-typeorm-save-extra-select --watch
```

應用程式使用記憶體內 SQLite，不需要另外安裝資料庫。啟動時會建立一筆固定資料：

```json
{
  "id": 1,
  "title": "第一篇文章"
}
```

可以先確認資料存在：

```bash
curl http://localhost:3000/posts/1
```

## 2. 觀察 `save()` 的額外 SELECT

先清空終端機畫面，再送出一個與原值不同的 title：

```bash
curl -i -X PATCH http://localhost:3000/posts/1/save \
  -H 'Content-Type: application/json' \
  -d '{"title":"用 save 更新的標題"}'
```

`PostsService.saveTitle()` 看起來只有一行：

```ts
return this.postsRepository.save({ id, title });
```

但終端機會出現類似以下 SQL：

```text
SELECT ... FROM "post" "Post" WHERE "Post"."id" IN (1)
BEGIN TRANSACTION
UPDATE "post" SET "title" = ? WHERE "id" IN (1)
COMMIT
```

第一條 SELECT 並不是 Controller 主動查詢。它來自 `save()`：TypeORM 先載入資料庫中的版本，再判斷這筆資料應該新增或更新，以及哪些欄位真的改變。

> 請務必傳入不同的 title。若值沒有改變，TypeORM 比對後不會送出 UPDATE，畫面只剩 SELECT，容易誤以為範例失效。

## 3. 改用意圖明確的 `update()`

再送出另一個新標題：

```bash
curl -i -X PATCH http://localhost:3000/posts/1/update \
  -H 'Content-Type: application/json' \
  -d '{"title":"用 update 更新的標題"}'
```

這次 Service 使用：

```ts
const result = await this.postsRepository.update(id, { title });
```

終端機只會看到直接更新：

```text
UPDATE "post" SET "title" = ? WHERE "id" IN (1)
```

`update()` 不需要先載入 Entity，也不會自動確認目標是否存在。因此範例另外檢查 `UpdateResult.affected`；零筆受到影響時回傳 404。

## 4. 比較不存在的 ID

`update()` 面對不存在的 ID，只會得到零筆受影響：

```bash
curl -i -X PATCH http://localhost:3000/posts/999/update \
  -H 'Content-Type: application/json' \
  -d '{"title":"不存在的文章"}'
```

本範例會回傳 `404 Not Found`。

同一個 ID 改用 `save()`：

```bash
curl -i -X PATCH http://localhost:3000/posts/999/save \
  -H 'Content-Type: application/json' \
  -d '{"title":"save 建立的文章"}'
```

TypeORM 先 SELECT，發現沒有這筆資料後改走 INSERT。這正是 `save()` 不能無條件換成 `update()` 的原因：兩者不只效能不同，語意也不同。

## 5. 執行測試

```bash
npx jest --config apps/day-20-typeorm-save-extra-select/test/jest-e2e.json --runInBand
```

測試會透過自訂 TypeORM logger 擷取 SQL，驗證：

- `save()` 更新既有資料時同時出現 SELECT 與 UPDATE。
- `update()` 只送出一條 UPDATE。
- `update()` 找不到資料時回傳 404。
- `save()` 收到不存在的 ID 時會建立資料。

## 總結

`save()` 是方便的高階持久化 API，代價是 TypeORM 必須先理解資料目前的狀態。當需求已經明確是「更新符合條件的資料」時，`update()` 能更直接地表達意圖，也能避開更新前的 SELECT。

> 先確認操作意圖，再選 persistence API；不要只因為 `save()` 什麼都能做，就讓它包辦所有寫入。
