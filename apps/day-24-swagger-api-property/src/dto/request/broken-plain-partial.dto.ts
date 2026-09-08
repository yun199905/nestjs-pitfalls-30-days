import type { PostFieldsDto } from './post-fields.dto';

// 問題四：base DTO 的 metadata 是完整的，錯在拿它的「型別」而不是拿它本身。
// Partial<T> 編譯後不存在，design:paramtypes 只剩 Object，Swagger 連 requestBody 都不會產生。
export type PlainPartialUpdatePostDto = Partial<PostFieldsDto>;
