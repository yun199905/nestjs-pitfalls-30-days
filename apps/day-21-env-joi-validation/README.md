# Day 21 練習題：`get<number>()` 真的會拿到 number 嗎？

## 目標

重現 `ConfigService.get<number>('PORT')` 在 TypeScript 看起來是 `number`，執行期拿到的卻仍是字串，並分別用 Joi `validationSchema` 與 custom `validate()` 在應用程式啟動時完成轉型與驗證。

這一題最重要的判斷是：

> 泛型只告訴 TypeScript 你希望拿到什麼，validation schema 或 custom validate 才處理執行期資料。

Joi 與 custom `validate()` 都不是另一個取得設定值的 API。啟用驗證前後，程式都透過同一個 `ConfigService.get()` 取值；差別在於 `ConfigModule` 是否先保存了轉換、驗證後的結果。

練習預設保留尚未修正的狀態。

## 1. 確認環境變數

Day 21 固定讀取自己的 `.env.example`，不需要另外建立 `.env`，也不會受到 repo 根目錄 `.env` 影響。

目前的內容是：

```dotenv
PORT=3000
```

## 2. 先觀察坑點

執行：

```bash
npx nest start day-21-env-joi-validation
```

這支程式不會啟動 HTTP server。它建立 Nest application context、讀取設定、印出結果後便會自行結束。

預設狀態會看到類似結果：

```text
┌─────────┬─────────────────────────────────────┬────────┬─────────────┬──────────┐
│ (index) │ source                              │ value  │ runtimeType │ nextPort │
├─────────┼─────────────────────────────────────┼────────┼─────────────┼──────────┤
│ 0       │ process.env.PORT                    │ '3000' │ 'string'    │ '30001'  │
│ 1       │ configService.get<number>('PORT')   │ '3000' │ 'string'    │ '30001'  │
└─────────┴─────────────────────────────────────┴────────┴─────────────┴──────────┘
```

`main.ts` 明明告訴 TypeScript 要取得 number：

```typescript
const configPort = configService.get<number>('PORT');
```

但 `.env.example` 經過 dotenv 讀入後，原始值仍是 `'3000'`。泛型在 JavaScript 執行前就被移除了，不會產生任何轉型程式碼，因此實際運算仍然是：

```typescript
'3000' + 1; // '30001'
```

## 3. 用 Joi 在啟動時轉型與驗證

打開 `src/day-21-env-joi-validation.module.ts`，取消 `PORT` 規則的註解：

```typescript
validationSchema: Joi.object({
  PORT: Joi.number().port().default(3000),
}),
```

重新執行相同指令：

```bash
npx nest start day-21-env-joi-validation
```

這次結果會變成：

```text
┌─────────┬─────────────────────────────────────┬────────┬─────────────┬──────────┐
│ (index) │ source                              │ value  │ runtimeType │ nextPort │
├─────────┼─────────────────────────────────────┼────────┼─────────────┼──────────┤
│ 0       │ process.env.PORT                    │ '3000' │ 'string'    │ '30001'  │
│ 1       │ configService.get<number>('PORT')   │ 3000   │ 'number'    │ 3001     │
└─────────┴─────────────────────────────────────┴────────┴─────────────┴──────────┘
```

第一列仍然是字串，因為 Node.js 的 `process.env` 本來就以字串保存環境變數。第二列變成 number，是因為：

1. `ConfigModule` 將設定交給 Joi。
2. `Joi.number()` 將可轉換的數字字串轉成 number。
3. `ConfigModule` 保存驗證後的結果。
4. `ConfigService.get()` 優先讀取這份已驗證的資料。

`.port()` 進一步限制數字必須位於合法的 TCP/UDP port 範圍；`.default(3000)` 則在沒有提供 `PORT` 時產生真正的 number 預設值。

## 4. 解法二：custom `validate()`

`ConfigModule.forRoot()` 也接受同步的 `validate` 函式。函式會收到載入的設定，必須回傳驗證後的設定；如果函式拋出錯誤，Nest application 就不會完成 bootstrap。

本練習的 `src/env.validation.ts` 使用官方文件示範的 class-transformer 與 class-validator 寫法：

```typescript
import { plainToInstance } from 'class-transformer';
import { IsInt, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsInt()
  @Min(0)
  @Max(65535)
  PORT!: number;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const rawPort = config.PORT ?? 3000;

  if (typeof rawPort === 'string' && rawPort.trim() === '') {
    throw new Error('PORT must be a number');
  }

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    { ...config, PORT: rawPort },
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return {
    ...config,
    PORT: validatedConfig.PORT,
  };
}
```

這段程式的責任分工是：

1. `config.PORT ?? 3000` 在缺值時提供 number 預設值。
2. `plainToInstance()` 建立帶有 runtime metadata 的 class instance。
3. `enableImplicitConversion: true` 依照 `PORT: number` 的 metadata，將 `'3000'` 轉成 `3000`。
4. `@IsInt()`、`@Min()`、`@Max()` 驗證整數與範圍。
5. 函式回傳轉換後的 `PORT`，讓 ConfigService 保存 number，而不是原始字串。

空字串要在轉型前另外拒絕，因為 JavaScript 的 `Number('')` 會得到 `0`，而 `0` 剛好能通過這組範圍規則。

### 切換到 custom validate

先把 Joi 的 `PORT` 規則恢復成註解，再將整個 `validationSchema` 註解起來。接著取消 module 頂端的 import：

```typescript
import { validateEnvironment } from './env.validation';
```

並啟用 `validate`：

```typescript
ConfigModule.forRoot({
  envFilePath: 'apps/day-21-env-joi-validation/.env.example',
  validatePredefined: false,
  validate: validateEnvironment,
});
```

重新執行：

```bash
npx nest start day-21-env-joi-validation
```

ConfigService 一樣會取得真正的 number：

```text
configService.get<number>('PORT') → 3000 / number
nextPort                          → 3001
```

> 一次只啟用一種解法。`@nestjs/config` 4.x 的實作會優先執行 `validate`，但不要依賴這個 precedence，也不要同時設定 `validate` 與 `validationSchema`。

### 兩種解法怎麼選？

|                        | Joi `validationSchema`       | custom `validate()`                                        |
| ---------------------- | ---------------------------- | ---------------------------------------------------------- |
| 轉型方式               | `Joi.number()`               | class-transformer `enableImplicitConversion`               |
| 驗證方式               | Joi schema rules             | class-validator decorators                                 |
| 優點                   | 精簡、設定契約集中且容易閱讀 | 程式控制力高，可沿用既有 class-transformer/class-validator |
| 代價                   | 需要熟悉 Joi schema          | class、decorator 與轉型設定的樣板較多                      |
| ConfigService 最終結果 | `PORT` 是 number             | `PORT` 是 number                                           |

兩者的共同原則比選擇哪一套更重要：轉型與驗證應集中在設定載入邊界，並將處理後的設定回傳給 ConfigModule。

### `isGlobal` 會影響驗證與轉型結果嗎？

不會。`validationSchema`／`validate` 與 `isGlobal` 負責的是兩件不同的事：

| 設定                           | 負責事項                                     |
| ------------------------------ | -------------------------------------------- |
| `validationSchema`／`validate` | 驗證、套用預設值與執行期轉型                 |
| `isGlobal`                     | `ConfigService` 是否能被其他 module 直接注入 |

`Day21EnvJoiValidationModule` 已直接 import `ConfigModule.forRoot()`。因此，只要 Joi 或 custom validate 已正確處理 `PORT`，無論 `isGlobal` 是 `false` 或 `true`，這個 application context 中的 `ConfigService` 都會讀到 number。移除 `isGlobal: true` 或將它改成 `false`，不會讓已驗證的值退回字串。

反過來說，若某個 module 沒有 import `ConfigModule`，`isGlobal: false` 可能讓它無法注入 `ConfigService`；這是 provider 可見性的問題，不是 Joi 有沒有執行轉型的問題。

> global 決定拿不拿得到 ConfigService，validationSchema 或 validate 決定拿到的設定是否經過驗證與轉型。

## 5. 兩種解法都會讓設定錯誤提早失敗

保持其中一種解法啟用，將 `.env.example` 改成：

```dotenv
PORT=not-a-number
```

重新執行時，application context 會在建立階段直接失敗。兩種解法都會阻止應用程式繼續啟動，但錯誤格式不同。例如 Joi 會顯示：

```text
Config validation error: "PORT" must be a number
```

custom `validate()` 則會拋出 `validateEnvironment` 產生的錯誤；非數字輸入會包含 `class-validator` 的 `isInt` 驗證結果。

再試一次超出合法 port 範圍的值：

```dotenv
PORT=70000
```

這次同樣無法完成 bootstrap。設定錯誤因此會在應用程式真正開始工作前就被發現。

## 6. 為什麼不直接 `Number()`？

手動轉型確實能讓正常輸入完成加法：

```typescript
const rawPort = configService.get<number>('PORT');
const port = Number(rawPort);
```

但 `Number('not-a-number')` 只會得到 `NaN`，不會阻止應用程式啟動。每個使用設定的地方也都必須記得重複轉型。Joi 與 custom validate 都能將轉型、驗證集中在設定載入邊界，失敗時間更早。

另外兩個常見寫法也不會替既有值轉型：

```typescript
configService.getOrThrow<number>('PORT');
configService.get<number>('PORT', 3000);
```

`getOrThrow()` 只保證 key 存在；default value 只在 key 不存在時使用。當 `PORT` 已存在且內容是 `'3000'`，兩者仍會回傳字串。

## 7. 測試驗證

設定測試會分別建立未驗證、使用 Joi schema 與使用 custom validate 的 ConfigModule，證明差異來自執行期驗證，而不是泛型：

```bash
npx jest --runInBand \
  apps/day-21-env-joi-validation/src/environment-validation.spec.ts
```

測試涵蓋：

- 沒有驗證時取得字串，`port + 1` 得到 `'30001'`。
- 啟用 Joi 或 custom validate 後取得 number，`port + 1` 得到 `3001`。
- 兩種解法都會在沒有提供 `PORT` 時套用 number 預設值。
- 兩種解法都拒絕非數字與空字串。
- 兩種解法都拒絕小於 `0` 或大於 `65535` 的值。
- custom validate 回傳的是轉換後的 number，而不是原始字串。

## 8. 還原練習

實驗完成後：

1. 將 `.env.example` 的 `PORT` 改回 `3000`。
2. 將 Joi 的 `PORT` 規則重新註解。
3. 確認 `validationSchema` 已恢復、custom validate 的 import 與 `validate` property 都維持註解。

這樣下次打開練習時，仍會從泛型看似正確、執行期卻是字串的狀態開始。
