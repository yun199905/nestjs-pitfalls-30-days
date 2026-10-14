import { ApiProperty } from '@nestjs/swagger';

// 這支 DTO 本身沒有任何問題。
// 但因為 BrokenPostDto.tags 沒有指明元素型別，Swagger 從來不會掃描到它，
// 所以它不會出現在 components.schemas 裡。
export class BrokenTagDto {
  @ApiProperty({ description: '標籤名稱' })
  name: string;

  @ApiProperty({ description: '標籤代稱' })
  slug: string;
}
