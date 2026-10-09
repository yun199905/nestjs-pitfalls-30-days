import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: '第一篇文章' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 1, description: '文章作者 ID' })
  @IsInt()
  @Min(1)
  authorId: number;
}
