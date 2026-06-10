import { IsBoolean } from 'class-validator';
// import { Transform } from 'class-transformer';

export class ImplicitPostsQueryDto {
  // 正確解法：先把字串 'true' / 'false' 轉成真正的 boolean，再交給驗證器檢查。
  // @Transform(({ value }: { value: string }) => {
  //   if (value === 'true') return true;

  //   if (value === 'false') return false;
  //   return value;
  // })
  @IsBoolean()
  isPublished: boolean;
}
