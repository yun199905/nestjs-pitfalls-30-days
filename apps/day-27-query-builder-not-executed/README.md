# Day 27 練習題：TypeORM QueryBuilder 忘記執行查詢

今天要踩的坑，是把 TypeORM QueryBuilder 誤認成查詢結果。

Service 已經寫好 `where` 與 `orderBy`，Controller 也確實收到一個物件；但呼叫 API 時，client 沒有拿到文章陣列，反而收到 500。原因不是 SQL 寫錯，而是程式只完成了「組查詢」，還沒有真正執行它。

這題最重要的判斷是：

> QueryBuilder 描述要執行的查詢；`getMany()`、`getOne()` 等終結方法回傳的才是查詢結果。

## 啟動練習

本練習使用 in-memory SQLite，不需要另外啟動資料庫：

```bash
npx nest start day-27-query-builder-not-executed
```

程式啟動時會建立兩篇已發布文章與一篇草稿。API 只查詢已發布文章：

```text
GET /posts
```

## 重現問題

呼叫文章列表：

```bash
curl -i http://localhost:3000/posts
```

Client 會收到：

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json; charset=utf-8
```

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

終端機則會看到類似訊息：

```text
TypeError: Converting circular structure to JSON
```

觀察 `PostsService.getPublishedPosts()`：

```typescript
getPublishedPosts() {
  // 取消 `.getMany()` 的區塊註解，實際執行查詢並取得 Post[]。
  return this.postsRepository
    .createQueryBuilder('post')
    .where('post.published = :published', { published: true })
    .orderBy('post.id', 'ASC') /* .getMany() */;
}
```

請回答：

1. `createQueryBuilder()` 回傳的是文章資料，還是用來描述查詢的物件？
2. 這段程式何時真正把 SQL 送到資料庫？
3. SQL 尚未執行，為什麼 HTTP response 會在 JSON 序列化階段失敗？

## 修正目標

只修改查詢的回傳階段，不更換 Repository API、不手動處理 JSON，也不要使用 circular-safe replacer。

修正時只需移除 `.getMany()` 前後的 `/*` 與 `*/`。這個練習刻意省略方法的顯式回傳型別，讓 TypeScript 能在取消註解後直接將回傳值重新推導為 `Promise<Post[]>`：

```typescript
getPublishedPosts(): Promise<Post[]> {
  return this.postsRepository
    .createQueryBuilder('post')
    .where('post.published = :published', { published: true })
    .orderBy('post.id', 'ASC')
    .getMany();
}
```

修正後再次呼叫同一支 API：

```bash
curl -i http://localhost:3000/posts
```

預期得到 HTTP 200：

```json
[
  {
    "id": 1,
    "title": "NestJS 排坑筆記",
    "published": true
  },
  {
    "id": 2,
    "title": "TypeORM QueryBuilder 實戰",
    "published": true
  }
]
```

## 驗證方式

執行 Service 測試：

```bash
npx jest --runInBand \
  apps/day-27-query-builder-not-executed/src/posts/posts.service.spec.ts
```

測試會確認：

- `getPublishedPosts()` 目前回傳 `SelectQueryBuilder`，不是 Entity 陣列。
- 目前專案使用的 TypeORM 版本無法直接序列化該 QueryBuilder。
- 對同一個 QueryBuilder 呼叫 `getMany()` 後，能取得兩篇已發布文章。

執行 E2E 測試：

```bash
npx jest --config \
  apps/day-27-query-builder-not-executed/test/jest-e2e.json \
  --runInBand
```

E2E 測試會確認尚未修正時，`/posts` 因回傳 QueryBuilder 而得到標準 500 response。完成練習後，可以把 assertion 改成預期 HTTP 200 與上方的文章陣列。

## 延伸思考

- 如果預期只有一筆資料，應該選擇哪一個 QueryBuilder 方法？
- `await queryBuilder` 是否會執行 SQL？
- `getSql()` 能取得 SQL 字串，是否代表查詢已執行？
- 明確標註 `Promise<Post[]>`，能否讓 TypeScript 更早發現回傳物件錯誤？
