# Day 15 練習題：Lazy Loading 造成的 N+1

## 目標
重現兩種殊途同歸的 N+1 查詢問題：一種是手動在迴圈裡對每個 `User` 各查一次 `Post`，另一種是把關聯設成 `lazy: true`，單純存取 `user.posts` 這個屬性也會觸發一次查詢。兩者都用 TypeORM 的 `relations` 選項一次查完來修復，並額外實驗「忘記 await lazy relation」會發生什麼事。

## 步驟指示

### 1. 觀察坑點一：手動迴圈查詢

1. 啟動服務後，`UsersService` 會自動建立 3 個 `User`，每人各有 2~3 篇 `Post`。
2. 呼叫 `GET /users/manual-loop`。
3. 觀察終端機印出的 SQL log：1 次查詢 `User` 列表，緊接著是 3 次分別查詢每個 `User` 的 `Post`（1 + N 次查詢）。
4. 看 `src/users/users.service.ts` 的 `findAllWithManualLoop()`：程式碼裡明白寫著「再查一次 `postsRepository`」，只要多看一眼迴圈內容就能發現。

### 2. 觀察坑點二：存取 lazy relation 屬性

1. 打開 `src/users/user.entity.ts`，注意 `posts` 這個關聯欄位被設成 `{ lazy: true }`，型別是 `Promise<Post[]>`。
2. 呼叫 `GET /users/lazy-relation`。
3. 觀察終端機印出的 SQL log：一樣是 1 + N 次查詢，但看 `findAllWithLazyRelation()` 的程式碼——完全沒有出現 `postsRepository`，只是很自然地 `await user.posts`。語法上跟存取一個普通欄位沒有任何差別，卻一樣觸發了額外查詢。

### 3. 動手修復

1. 打開 `src/users/users.service.ts`，看 `findAllPreloaded()`：
   ```typescript
   async findAllPreloaded() {
     const users = await this.usersRepository.find({
       relations: {
         posts: true,
       },
     });

     const result = [];
     for (const user of users) {
       const posts = await user.posts; // 已經被 join 進來，await 不會再多查一次
       result.push({
         id: user.id,
         name: user.name,
         posts: posts.map((post) => ({ id: post.id, title: post.title })),
       });
     }
     return result;
   }
   ```
2. 差異只在於 `find()` 多帶了 `relations: { posts: true }`。這次 `user.posts` 這個 lazy 屬性在建立時就已經拿到資料，`await` 只是把已經解決好的 Promise 拆開，不會再觸發任何查詢——無論你是像坑點一那樣手動查詢，還是像坑點二那樣存取 lazy 屬性，這個修法都同時解決。

### 4. 測試驗證

1. 呼叫 `GET /users/preloaded`。
2. 觀察終端機印出的 SQL log：只會多印出 1 條帶 `LEFT JOIN` 的查詢，不會隨 user 數量增加。
3. 比對三個端點回傳的 JSON：每個 user 的 `posts` 內容應該完全一致。

### 5. 延伸實驗：忘記 await 會怎樣？

1. 呼叫 `GET /users/without-await`。
2. 觀察回應內容：每個 user 的 `posts` 欄位變成 `{}`，而不是文章陣列。
3. 打開 `findAllWithoutAwait()`：程式碼把 `user.posts`（一個還沒被解開的 Promise）直接塞進回傳物件，JSON 序列化時 Promise 沒有任何可枚舉屬性，於是變成一個空物件。
4. 再看一次終端機的 SQL log：即使程式碼完全沒有 `await`，這 3 次查詢仍然在背景被送出去了——存取 lazy 屬性的那一刻，查詢就已經發生，`await` 只決定你要不要等它、要不要拿它的結果。
