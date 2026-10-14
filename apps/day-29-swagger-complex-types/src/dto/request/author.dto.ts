import { ApiProperty } from '@nestjs/swagger';
import { PostDto } from './post.dto';

export class AuthorDto {
  @ApiProperty({ description: '作者顯示名稱' })
  displayName: string;

  // 循環的兩側都要用 lazy resolver，才不用依賴「誰先被求值」
  @ApiProperty({ type: () => PostDto })
  featuredPost: PostDto;
}
