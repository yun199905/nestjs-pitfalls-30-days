import { Controller, Get, Inject } from '@nestjs/common';
import type { PostConfig } from './post-config.interface';
import { PostConfigService } from './post-config.service';

@Controller('posts/config')
export class Day04UseFactoryInjectController {
  constructor(
    @Inject('POST_CONFIG')
    private readonly postConfig: PostConfig,
    @Inject('POST_CONFIG_ALIGNED')
    private readonly alignedPostConfig: PostConfig,
    @Inject('POST_CONFIG_OBJECT')
    private readonly objectPostConfig: PostConfig,
    @Inject('POST_CONFIG_VALIDATED')
    private readonly validatedPostConfig: PostConfig,
    // 解法三不需要字串 token，直接依型別解析。
    private readonly postConfigService: PostConfigService,
  ) {}

  // 主坑：inject 順序與 factory 參數不一致，兩個值靜默對調。
  @Get()
  getConfig(): PostConfig {
    return this.postConfig;
  }

  @Get('aligned')
  getAlignedConfig(): PostConfig {
    return this.alignedPostConfig;
  }

  @Get('object')
  getObjectConfig(): PostConfig {
    return this.objectPostConfig;
  }

  @Get('class')
  getClassConfig(): PostConfig {
    const { apiBaseUrl, defaultAuthor } = this.postConfigService;
    return { apiBaseUrl, defaultAuthor };
  }

  @Get('validated')
  getValidatedConfig(): PostConfig {
    return this.validatedPostConfig;
  }
}
