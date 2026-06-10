import { IsBoolean } from 'class-validator';

export class ManualPostsQueryDto {
  // 正確解法：先把字串 'true' / 'false' 轉成真正的 boolean，再交給驗證器檢查。
  // @Transform(({ value }: { value: string }) => {
  //   if (value === 'true') return true;

  //   if (value === 'false') return false;
  //   return value;
  // })
  // 常見誤解：很多人會直覺改成 @Type(() => Boolean)，
  // 但這會把 'false' 這種非空字串也轉成 true，問題反而更隱蔽。
  // @Type(() => Boolean)
  // 目前先保留最直覺但有問題的寫法，讓文章先示範驗證失敗的狀況。
  @IsBoolean()
  isPublished: boolean;
}
