import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PostMetaDto } from './post-meta.dto';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @ValidateNested()
  @Type(() => PostMetaDto)
  postMeta: PostMetaDto;
}
