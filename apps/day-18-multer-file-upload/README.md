# Day 18｜檔案上傳耗盡記憶體練習

這份練習用三條文章封面上傳 API，比較未限制的 MemoryStorage、只靠 `MaxFileSizeValidator` 的 MemoryStorage，以及有 `limits.fileSize` 的 DiskStorage：

```text
POST /posts/:postId/cover/unsafe
POST /posts/:postId/cover/validator
POST /posts/:postId/cover/safe
```

三條路由都接收 `multipart/form-data`，檔案欄位名稱固定為 `file`。validator 與 safe 路由的單檔上限都是 1 MiB，但檢查發生的時間點不同。

## 1. 啟動專案

在 repo 根目錄執行：

```bash
pnpm exec nest start day-18-multer-file-upload --watch
```

API 預設啟動於 `http://localhost:3000`。

## 2. 準備測試檔案

建立一個小檔案，以及一個略大於 1 MiB 的檔案：

```bash
printf 'small cover image' > /tmp/day18-small.bin
dd if=/dev/zero of=/tmp/day18-large.bin bs=1024 count=1025
```

先預測各請求會得到什麼結果：

| 情境               | unsafe | validator | safe |
| ------------------ | ------ | --------- | ---- |
| 上傳小檔案         | ?      | ?         | ?    |
| 上傳 1 MiB + 1 KiB | ?      | ?         | ?    |
| 沒有附加 `file`    | ?      | ?         | ?    |

## 3. 操作 unsafe 路由

上傳小檔案：

```bash
curl -i -X POST http://localhost:3000/posts/42/cover/unsafe \
  -F 'file=@/tmp/day18-small.bin;type=application/octet-stream'
```

預期回傳 `201 Created`：

```json
{
  "postId": "42",
  "originalName": "day18-small.bin",
  "size": 17,
  "storage": "memory",
  "hasBuffer": true
}
```

接著上傳大檔案：

```bash
curl -i -X POST http://localhost:3000/posts/42/cover/unsafe \
  -F 'file=@/tmp/day18-large.bin;type=application/octet-stream'
```

預期仍回傳 `201 Created`，`size` 為 `1049600`，`hasBuffer` 為 `true`。

## 4. 操作 validator 路由

上傳小檔案：

```bash
curl -i -X POST http://localhost:3000/posts/42/cover/validator \
  -F 'file=@/tmp/day18-small.bin;type=application/octet-stream'
```

預期回傳 `201 Created`，`storage` 為 `memory`，`hasBuffer` 為 `true`。

接著上傳大檔案：

```bash
curl -i -X POST http://localhost:3000/posts/42/cover/validator \
  -F 'file=@/tmp/day18-large.bin;type=application/octet-stream'
```

預期回傳 `400 Bad Request`：

```json
{
  "message": "Validation failed (current file size is 1049600, expected size is less than 1048576)",
  "error": "Bad Request",
  "statusCode": 400
}
```

錯誤訊息裡能報出完整的 `1049600`，代表 Multer 已經把整個檔案收進 Buffer，之後才輪到 `ParseFilePipe` 判斷太大。

## 5. 操作 safe 路由

上傳小檔案：

```bash
curl -i -X POST http://localhost:3000/posts/42/cover/safe \
  -F 'file=@/tmp/day18-small.bin;type=application/octet-stream'
```

預期回傳 `201 Created`：

```json
{
  "postId": "42",
  "originalName": "day18-small.bin",
  "size": 17,
  "storage": "disk",
  "hasBuffer": false
}
```

接著上傳大檔案：

```bash
curl -i -X POST http://localhost:3000/posts/42/cover/safe \
  -F 'file=@/tmp/day18-large.bin;type=application/octet-stream'
```

預期回傳 `413 Payload Too Large`，而且是在 Multer 接收階段就中止，不會進入 Pipe 與 Controller：

```json
{
  "message": "File too large",
  "error": "Payload Too Large",
  "statusCode": 413
}
```

## 6. 操作錯誤情境

沒有附加檔案：

```bash
curl -i -X POST http://localhost:3000/posts/42/cover/safe
```

預期回傳 `400 Bad Request`。

使用錯誤的欄位名稱：

```bash
curl -i -X POST http://localhost:3000/posts/42/cover/safe \
  -F 'cover=@/tmp/day18-small.bin'
```

預期回傳：

```json
{
  "message": "Unexpected field - cover",
  "error": "Bad Request",
  "statusCode": 400
}
```

## 7. 對照結果

| 情境          |                   unsafe |                  validator |                      safe |
| ------------- | -----------------------: | -------------------------: | ------------------------: |
| 小檔案        | `201`、`hasBuffer: true` |   `201`、`hasBuffer: true` | `201`、`hasBuffer: false` |
| 1 MiB + 1 KiB |                    `201` | `400`（已收完才被 Pipe 擋） |      `413 File too large` |
| 沒有 `file`   |                    `400` |                      `400` |                     `400` |

## 8. 執行自動測試

```bash
pnpm exec jest --config apps/day-18-multer-file-upload/test/jest-e2e.json --runInBand
pnpm exec nest build day-18-multer-file-upload
```

測試涵蓋成功上傳、Validator 與 `limits.fileSize` 的拒絕時機差異、缺少檔案、欄位名稱錯誤與暫存檔清理。

練習完成後可刪除測試檔案：

```bash
rm /tmp/day18-small.bin /tmp/day18-large.bin
```
