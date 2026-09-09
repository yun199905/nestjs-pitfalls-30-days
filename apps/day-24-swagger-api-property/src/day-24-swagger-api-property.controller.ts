import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MissingDecoratorUpdatePostDto } from './dto/request/broken-missing-decorator.dto';
import { NestedInterfaceUpdatePostDto } from './dto/request/broken-nested-interface.dto';
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
    summary: '問題一｜完全沒有 @ApiProperty()：schema 的 properties 是空的',
    description:
      '四個欄位都只有 TypeScript 型別，未向 Swagger 登記任何 metadata，因此 MissingDecoratorUpdatePostDto 產生的是 properties 為空的 model。body 型別是實際的 class，所以 requestBody 仍會產生，只是它指向的 schema 沒有任何欄位；runtime 則會完整收到這四個欄位。',
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

  @Patch(':id/nested-interface')
  @ApiOperation({
    summary: '問題二｜巢狀型別使用 interface：publishOptions 只有 type: object',
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
    summary: '問題三｜body 型別使用 Partial<T>：這支端點沒有 requestBody',
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
    summary: '正解｜UpdatePostDto：四個欄位齊全，且全部為 optional',
    description:
      '以 @nestjs/swagger 的 PartialType(PostFieldsDto) 建立。tags 為 string 陣列、publishOptions 以 $ref 指向 PublishOptionsDto，且沒有 required 清單。',
  })
  updateCorrect(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ): UpdatePostResponse {
    return this.day24SwaggerApiPropertyService.update(id, 'correct', body);
  }
}
