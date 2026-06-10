import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ImplicitPostsQueryDto } from './dto/implicit-posts.query.dto';
import { ManualPostsQueryDto } from './dto/manual-posts.query.dto';

@Controller('posts')
export class Day08BooleanTransformController {
  @Get('manual-version')
  findWithExplicitBoolean(
    @Query(new ValidationPipe({ transform: true }))
    query: ManualPostsQueryDto,
  ) {
    return query;
  }

  @Get('implicit-version')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  findWithImplicitBoolean(@Query() query: ImplicitPostsQueryDto) {
    return query;
  }
}
