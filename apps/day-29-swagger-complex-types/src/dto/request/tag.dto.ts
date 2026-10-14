import { ApiProperty } from '@nestjs/swagger';

export class TagDto {
  @ApiProperty({ description: '標籤名稱' })
  name: string;

  @ApiProperty({ description: '標籤代稱' })
  slug: string;
}
