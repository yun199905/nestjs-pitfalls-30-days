import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class IsOptionalUpdatePostDto {
  // 這是本題的錯誤示範：null 與 undefined 都會讓其他驗證器被跳過。
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;
}
