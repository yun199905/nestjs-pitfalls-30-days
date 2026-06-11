import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PostMetaDto } from './post-meta.dto';

export class CreatePostWithoutTypeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @ValidateNested()
  postMeta: PostMetaDto;
}
