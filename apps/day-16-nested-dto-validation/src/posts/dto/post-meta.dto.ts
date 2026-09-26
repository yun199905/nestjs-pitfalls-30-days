import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PostMetaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  seoTitle: string;

  @IsString()
  @MaxLength(160)
  seoDescription: string;
}
