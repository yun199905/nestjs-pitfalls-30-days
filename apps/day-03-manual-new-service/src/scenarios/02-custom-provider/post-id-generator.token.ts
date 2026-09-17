// 注入 token：使用端只認這個 token，不認任何具體實作。
export const POST_ID_GENERATOR = Symbol('POST_ID_GENERATOR');

export interface PostIdGenerator {
  readonly kind: 'uuid' | 'sequential';
  next(): string;
}
