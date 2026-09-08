import { ApiProperty } from '@nestjs/swagger';
import { PublishOptionsDto } from './publish-options.dto';

// 五支端點共用的正確欄位集；每支 broken DTO 都是它的複本，只壞掉一處。
export class PostFieldsDto {
  @ApiProperty({ description: '文章標題' })
  title: string;

  @ApiProperty({ description: '文章內容' })
  content: string;

  @ApiProperty({ type: [String], description: '文章標籤' })
  tags: string[];

  @ApiProperty({ type: [Number], description: '相關文章 ID' })
  relatedPostIds: number[];

  @ApiProperty({ type: () => PublishOptionsDto })
  publishOptions: PublishOptionsDto;
}
