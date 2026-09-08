import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MissingDecoratorUpdatePostDto } from './dto/request/broken-missing-decorator.dto';
import { NestedInterfaceUpdatePostDto } from './dto/request/broken-nested-interface.dto';
import { UntypedArrayUpdatePostDto } from './dto/request/broken-untyped-array.dto';
import { UpdatePostDto } from './dto/request/update-post.dto';
import type { PlainPartialUpdatePostDto } from './dto/request/broken-plain-partial.dto';
import type { UpdatePostResponse } from './dto/response/update-post-response.dto';
import { Day24SwaggerApiPropertyService } from './day-24-swagger-api-property.service';

@Controller('posts')
export class Day24SwaggerApiPropertyController {
  constructor(
    private readonly day24SwaggerApiPropertyService: Day24SwaggerApiPropertyService,
  ) {}

  @Patch(':id/missing-decorator')
  @ApiOperation({
    summary: '問題一｜缺少 @ApiProperty()：content 不會出現在 schema',
    description:
      'content 只有 TypeScript 型別，未向 Swagger 登記 metadata，因此 MissingDecoratorUpdatePostDto 的 properties 中沒有這個欄位；其餘欄位皆正確。runtime 仍會完整收到 content。',
  })
  updateMissingDecorator(
    @Param('id') id: string,
    @Body() body: MissingDecoratorUpdatePostDto,
  ): UpdatePostResponse {
    return this.day24SwaggerApiPropertyService.update(
      id,
      'missing-decorator',
      body,
    );
  }

  @Patch(':id/untyped-array')
  @ApiOperation({
    summary: '問題二｜array 未指定元素型別：relatedPostIds 被描述成字串陣列',
    description:
      'tags 與 relatedPostIds 都只掛了不帶參數的 @ApiProperty()。reflection 只能取得 Array，無法得知元素型別，@nestjs/swagger 因此一律將 items 預設為 string —— string[] 剛好正確，number[] 則被描述錯誤。',
  })
  updateUntypedArray(
    @Param('id') id: string,
    @Body() body: UntypedArrayUpdatePostDto,
  ): UpdatePostResponse {
    return this.day24SwaggerApiPropertyService.update(
      id,
      'untyped-array',
      body,
    );
  }

  @Patch(':id/nested-interface')
  @ApiOperation({
    summary: '問題三｜巢狀型別使用 interface：publishOptions 只有 type: object',
    description:
      'interface 編譯為 JavaScript 後不存在，@ApiProperty() 取得的型別僅為 Object，因此無法展開 notifyFollowers，components.schemas 中也不會產生對應的 model。',
  })
  updateNestedInterface(
    @Param('id') id: string,
    @Body() body: NestedInterfaceUpdatePostDto,
  ): UpdatePostResponse {
    return this.day24SwaggerApiPropertyService.update(
      id,
      'nested-interface',
      body,
    );
  }

  @Patch(':id/plain-partial')
  @ApiOperation({
    summary: '問題四｜body 型別使用 Partial<T>：這支端點沒有 requestBody',
  })
  updatePlainPartial(
    @Param('id') id: string,
    @Body() body: PlainPartialUpdatePostDto,
  ): UpdatePostResponse {
    return this.day24SwaggerApiPropertyService.update(
      id,
      'plain-partial',
      body,
    );
  }

  @Patch(':id/correct')
  @ApiOperation({
    summary: '正解｜UpdatePostDto：五個欄位齊全，且全部為 optional',
    description:
      '以 @nestjs/swagger 的 PartialType(PostFieldsDto) 建立。tags 為 string 陣列、relatedPostIds 為 number 陣列、publishOptions 以 $ref 指向 PublishOptionsDto，且沒有 required 清單。',
  })
  updateCorrect(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ): UpdatePostResponse {
    return this.day24SwaggerApiPropertyService.update(id, 'correct', body);
  }
}
