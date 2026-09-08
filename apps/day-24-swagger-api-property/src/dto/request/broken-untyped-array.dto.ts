import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PublishOptionsDto } from './publish-options.dto';

class UntypedArrayPostFieldsDto {
  @ApiProperty({ description: '文章標題' })
  title: string;

  @ApiProperty({ description: '文章內容' })
  content: string;

  // 問題二：reflection 只知道「這是 Array」，items 預設 string —— string[] 是歪打正著。
  @ApiProperty({ description: '文章標籤' })
  tags: string[];

  // 問題二：同一個預設值套在 number[] 上就默默寫錯了，沒有任何警告。
  @ApiProperty({ description: '相關文章 ID' })
  relatedPostIds: number[];

  @ApiProperty({ type: () => PublishOptionsDto })
  publishOptions: PublishOptionsDto;
}

export class UntypedArrayUpdatePostDto extends PartialType(
  UntypedArrayPostFieldsDto,
) {}
