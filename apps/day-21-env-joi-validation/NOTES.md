# Day 21 素材備忘：`get<number>()` 的泛型謊言

這段原本寫在 day-17 的 `SettingsService`，因為 day-17 決定只聚焦「模組作用域」而移除。
它和 day-21 的主題（env 值的型別驗證）更搭，留在這裡當開場素材。

`configService.get<number>('PORT')` 的泛型只是對 TypeScript 的斷言，執行期不會幫你轉型——
`.env` 讀進來的一律是字串，所以拿到的是 `'3000'` 而不是 `3000`。

```ts
getTypeLie() {
  const port = this.configService.get<number>('PORT');

  return {
    value: port,
    typeofValue: typeof port,          // 'string'
    isNumber: typeof port === 'number', // false
    // 真的要數字，得自己轉
    afterConversion: Number(port),
    typeofAfterConversion: typeof Number(port),
  };
}
```

可以接到 day-21 的主線：這正是為什麼需要 `validationSchema`（joi）在啟動時就把型別轉好、驗好，
而不是等到某個 `port + 1` 變成 `'30001'` 才發現。
