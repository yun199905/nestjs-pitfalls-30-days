/**
 * 解法二的來源形狀：把多個純字串設定收成一個具名物件，
 * 讓 factory 只需要一個位置參數。
 */
export interface PostConfigSource {
  apiBaseUrl: string;
  defaultAuthor: string;
}
