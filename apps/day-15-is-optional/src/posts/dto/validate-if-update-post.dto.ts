import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class ValidateIfUpdatePostDto {
  // 只有真正省略欄位時才跳過驗證；null 仍會交給下方驗證器。
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  title?: string;
}
