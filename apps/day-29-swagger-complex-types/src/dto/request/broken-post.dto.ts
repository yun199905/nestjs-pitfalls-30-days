import { ApiProperty } from '@nestjs/swagger';
import { BrokenAuthorDto } from './broken-author.dto';
import { BrokenTagDto } from './broken-tag.dto';
import { PublishChannel } from './publish-channel.enum';

export class BrokenPostDto {
  // 純量型別是少數 reflection 就夠用的情況
  @ApiProperty({ description: '文章標題' })
  title: string;

  @ApiProperty({ description: '瀏覽次數' })
  viewCount: number;

  @ApiProperty({ description: '是否發布' })
  published: boolean;

  @ApiProperty({ description: '建立時間' })
  createdAt: Date;

  // 現象一：reflection 只知道「這是 Array」，items 被填上預設值 string，
  // 連帶 BrokenTagDto 也不會被掃描進 components.schemas。
  @ApiProperty()
  tags: BrokenTagDto[];

  // 現象二：enum 描述值域、isArray 描述容器，只給 enum 會得到單一 enum。
  @ApiProperty({ enum: PublishChannel })
  channels: PublishChannel[];

  // 現象三：union type 在 runtime 只剩 Object。
  @ApiProperty()
  externalRef: string | number;

  // 現象三：多維陣列在 runtime 一樣只剩 Array，維度資訊全失。
  @ApiProperty()
  keywordGroups: string[][];

  // 現象四：雖然明確指定 type，但這是立即求值；此時 BrokenAuthorDto 已經完成定義，所以 $ref 正常。
  @ApiProperty({ type: BrokenAuthorDto })
  author: BrokenAuthorDto;
}
