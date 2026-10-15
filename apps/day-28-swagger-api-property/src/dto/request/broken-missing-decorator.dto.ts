import { PartialType } from '@nestjs/swagger';
import { PublishOptionsDto } from './publish-options.dto';

// 問題一：四個欄位都有 TypeScript 型別，但沒有任何一個向 Swagger 登記 metadata。
// runtime 照樣收得到完整 JSON，OpenAPI schema 卻是空的。
class MissingDecoratorPostFieldsDto {
  title: string;

  content: string;

  tags: string[];

  publishOptions: PublishOptionsDto;
}

// PartialType() 沒有任何已登記的 metadata 可以複製 —— 問題一的延續，不是另一個坑。
export class MissingDecoratorUpdatePostDto extends PartialType(
  MissingDecoratorPostFieldsDto,
) {}
