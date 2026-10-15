import { PartialType } from '@nestjs/swagger';
import { PostFieldsDto } from './post-fields.dto';

// 正解：@nestjs/swagger 的 PartialType() 會建立新 class、複製 base 已登記的 metadata 並轉成 optional。
export class UpdatePostDto extends PartialType(PostFieldsDto) {}
