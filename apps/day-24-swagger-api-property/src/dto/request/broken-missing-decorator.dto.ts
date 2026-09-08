import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PublishOptionsDto } from './publish-options.dto';

class MissingDecoratorPostFieldsDto {
  @ApiProperty({ description: '文章標題' })
  title: string;

  // 問題一：只有這個欄位沒掛 @ApiProperty()。runtime 收得到，OpenAPI schema 裡卻不存在。
  content: string;

  @ApiProperty({ type: [String], description: '文章標籤' })
  tags: string[];

  @ApiProperty({ type: [Number], description: '相關文章 ID' })
  relatedPostIds: number[];

  @ApiProperty({ type: () => PublishOptionsDto })
  publishOptions: PublishOptionsDto;
}

// PartialType() 複製不到 base 沒登記的 content —— 問題一的延續，不是另一個坑。
export class MissingDecoratorUpdatePostDto extends PartialType(
  MissingDecoratorPostFieldsDto,
) {}
