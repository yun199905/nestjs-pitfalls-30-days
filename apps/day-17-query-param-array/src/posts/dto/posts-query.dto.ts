import { IsArray, IsOptional, IsString } from 'class-validator';

export class PostsQueryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
