import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DEMO_POST, type Post } from './post';

@Controller('posts')
export class Day24ResponseHandlingController {
  @Get()
  getPost(): Post {
    return DEMO_POST;
  }

  @Get('manual')
  getPostWithExpressResponse(@Res() response: Response): Post {
    response.json(DEMO_POST);

    // 即使留下 return，@Res() 仍讓 Nest 跳過標準的 response handling。
    return DEMO_POST;
  }

  @Get('passthrough')
  getPostWithPassthrough(@Res({ passthrough: true }) response: Response): Post {
    response.setHeader('x-demo-mode', 'passthrough');

    return DEMO_POST;
  }
}
