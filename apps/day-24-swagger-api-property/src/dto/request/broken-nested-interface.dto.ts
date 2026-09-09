import { ApiProperty, PartialType } from '@nestjs/swagger';

// 問題二：interface 編譯後不留痕跡，runtime 沒有 constructor 可以讓 Swagger 往下掃。
interface BrokenPublishOptions {
  notifyFollowers: boolean;
}

class NestedInterfacePostFieldsDto {
  @ApiProperty({ description: '文章標題' })
  title: string;

  @ApiProperty({ description: '文章內容' })
  content: string;

  @ApiProperty({ type: [String], description: '文章標籤' })
  tags: string[];

  // decorator 有掛，但 reflection 只拿得到 Object，只能印出空的 type: 'object'。
  @ApiProperty()
  publishOptions: BrokenPublishOptions;
}

export class NestedInterfaceUpdatePostDto extends PartialType(
  NestedInterfacePostFieldsDto,
) {}
