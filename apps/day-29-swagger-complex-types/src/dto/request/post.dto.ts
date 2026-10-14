import { ApiProperty } from '@nestjs/swagger';
import { AuthorDto } from './author.dto';
import { PublishChannel } from './publish-channel.enum';
import { TagDto } from './tag.dto';

export class PostDto {
  // 純量型別：reflection 拿得到 String，不需要額外宣告 type
  @ApiProperty({ description: '文章標題' })
  title: string;

  @ApiProperty({ description: '瀏覽次數' })
  viewCount: number;

  @ApiProperty({ description: '是否發布' })
  published: boolean;

  @ApiProperty({ description: '建立時間' })
  createdAt: Date;

  @ApiProperty({ type: [TagDto] })
  tags: TagDto[];

  @ApiProperty({
    enum: PublishChannel,
    enumName: 'PublishChannel',
    isArray: true,
    description: '發布通路',
  })
  channels: PublishChannel[];

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'number' }],
    description: '外部系統的文章識別碼',
  })
  externalRef: string | number;

  // 多維陣列是 type: [Dto] 這套語法表達不了的情況，只能下降到 items 明寫每一層
  @ApiProperty({
    type: 'array',
    items: { type: 'array', items: { type: 'string' } },
    description: 'SEO 關鍵字分組',
  })
  keywordGroups: string[][];

  @ApiProperty({ type: () => AuthorDto })
  author: AuthorDto;
}
