import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BrokenPostDto } from './dto/request/broken-post.dto';
import { PostDto } from './dto/request/post.dto';
import type { CreatePostResponse } from './dto/response/create-post-response.dto';
import { Day29SwaggerComplexTypesService } from './day-29-swagger-complex-types.service';

@Controller('posts')
export class Day29SwaggerComplexTypesController {
  constructor(
    private readonly day29SwaggerComplexTypesService: Day29SwaggerComplexTypesService,
  ) {}

  @Post('broken')
  @ApiOperation({
    summary:
      '問題一～四｜BrokenPostDto：欄位都有 @ApiProperty()，複雜型別卻描述不完整',
    description:
      'design:type 對陣列只留下 Array、對 union 只留下 Object，因此 tags 的 items 退化成 string（BrokenTagDto 不會出現在 components.schemas）、channels 變成單一 enum、externalRef 只剩 type: object、keywordGroups 少了一層陣列；author 與 featuredPost 即使直接指定 eager type，循環參照中仍有一側因求值時機而退化成 type: object。runtime 則會完整收到整個巢狀 JSON。',
  })
  createBroken(@Body() body: BrokenPostDto): CreatePostResponse {
    return this.day29SwaggerComplexTypesService.create('broken', body);
  }

  @Post('correct')
  @ApiOperation({
    summary: '正解｜PostDto：容器、值域與參照都明確描述',
    description:
      'tags 以 type: [TagDto] 指明元素型別、channels 以 enum 搭配 isArray 與 enumName 描述 enum 陣列、externalRef 以 oneOf 列出 string 與 number、keywordGroups 以巢狀 items 保留兩層陣列，author 與 AuthorDto.featuredPost 兩側都使用 type: () => Dto。產生的 schema 中沒有任何裸 object。',
  })
  createCorrect(@Body() body: PostDto): CreatePostResponse {
    return this.day29SwaggerComplexTypesService.create('correct', body);
  }
}
