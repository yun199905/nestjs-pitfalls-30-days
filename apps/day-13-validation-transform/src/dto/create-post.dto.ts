import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsIn, IsInt, IsString } from 'class-validator';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreatePostDto {
  @ApiProperty({
    example: '  NestJS Pipes  ',
    description:
      '刻意保留前後空白，用來觀察 @Transform() 的結果是否進入 handler。',
  })
  @Transform(({ value }: TransformFnParams) => trimString(value))
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    example: '12',
    description: '刻意以字串傳入，用來觀察 @Type(() => Number) 的轉換結果。',
  })
  @Type(() => Number)
  @IsInt()
  viewCount: number;

  @ApiHideProperty()
  @IsIn(['draft'])
  visibility = 'draft';

  @ApiPropertyOptional({
    example: 'client-only',
    description: '刻意不加驗證 decorator，因此 whitelist 開啟時會被移除。',
  })
  extraNote?: string;

  createSlug(): string {
    return this.title.toLowerCase().replace(/\s+/g, '-');
  }
}
