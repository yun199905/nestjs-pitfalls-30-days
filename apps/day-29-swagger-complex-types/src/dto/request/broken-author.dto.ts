import { ApiProperty } from '@nestjs/swagger';
import { BrokenPostDto } from './broken-post.dto';

export class BrokenAuthorDto {
  @ApiProperty({ description: '作者顯示名稱' })
  displayName: string;

  // 現象四：直接傳入 type 仍會立即求值。
  // decorator 執行時 BrokenPostDto 還沒定義完，type 與 design:type 都只能退化，最後得到 object。
  @ApiProperty({ type: BrokenPostDto })
  featuredPost: BrokenPostDto;
}
