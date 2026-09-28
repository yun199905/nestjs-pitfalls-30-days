import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';

@ApiTags('posts')
@Controller('posts')
export class Day13ValidationTransformController {
  @Post('transform-off')
  @ApiOperation({
    summary: '基準組｜transform: false',
    description: '驗證使用暫時 DTO，但 handler 收到原始 plain object。',
  })
  @ApiBody({
    type: CreatePostDto,
    examples: {
      default: {
        value: { title: '  NestJS Pipes  ', viewCount: '12' },
      },
    },
  })
  createWithTransformOff(
    @Body(new ValidationPipe({ transform: false })) body: CreatePostDto,
  ) {
    return this.describeRuntimeValue(body);
  }

  @Post('transform-on')
  @ApiOperation({
    summary: '正解組｜transform: true',
    description: 'handler 收到轉換完成、保有 prototype 的 DTO instance。',
  })
  @ApiBody({
    type: CreatePostDto,
    examples: {
      default: {
        value: { title: '  NestJS Pipes  ', viewCount: '12' },
      },
    },
  })
  createWithTransformOn(
    @Body(new ValidationPipe({ transform: true })) body: CreatePostDto,
  ) {
    return this.describeRuntimeValue(body);
  }

  @Post('transform-off-whitelist')
  @ApiOperation({
    summary: '進階組｜transform: false + whitelist: true',
    description:
      'handler 收到轉換與過濾後的 plain object，但不是 DTO instance。',
  })
  @ApiBody({
    type: CreatePostDto,
    examples: {
      default: {
        value: {
          title: '  NestJS Pipes  ',
          viewCount: '12',
          extraNote: 'client-only',
        },
      },
    },
  })
  createWithTransformOffAndWhitelist(
    @Body(new ValidationPipe({ transform: false, whitelist: true }))
    body: CreatePostDto,
  ) {
    return this.describeRuntimeValue(body);
  }

  private describeRuntimeValue(body: CreatePostDto) {
    return {
      isDtoInstance: body instanceof CreatePostDto,
      hasCreateSlug: typeof body.createSlug === 'function',
      receivedBody: body,
    };
  }
}
