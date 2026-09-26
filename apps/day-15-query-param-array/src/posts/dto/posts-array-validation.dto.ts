import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class PostsArrayValidationDto {
  @Transform(({ value }): unknown[] | undefined => {
    if (value === undefined) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
