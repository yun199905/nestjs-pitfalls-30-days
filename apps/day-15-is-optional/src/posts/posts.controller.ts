import { Body, Controller, Param, Patch } from '@nestjs/common';
import { IsOptionalUpdatePostDto } from './dto/is-optional-update-post.dto';
import { ValidateIfUpdatePostDto } from './dto/validate-if-update-post.dto';

@Controller('posts')
export class PostsController {
  @Patch(':id/is-optional')
  updateWithIsOptional(
    @Param('id') id: string,
    @Body() body: IsOptionalUpdatePostDto,
  ) {
    return { id, ...body };
  }

  @Patch(':id/validate-if')
  updateWithValidateIf(
    @Param('id') id: string,
    @Body() body: ValidateIfUpdatePostDto,
  ) {
    return { id, ...body };
  }
}
