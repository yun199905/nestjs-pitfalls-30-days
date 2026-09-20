import { Injectable, Logger } from '@nestjs/common';
import type { PostConfig } from '../posts/post-config.interface';

const FALLBACK_CONFIG: PostConfig = {
  apiBaseUrl: 'http://localhost:3000/fallback',
  defaultAuthor: 'guest',
  source: 'fallback',
};

const REMOTE_CONFIG: PostConfig = {
  apiBaseUrl: 'https://posts.example.test',
  defaultAuthor: 'YUN',
  source: 'remote',
};

@Injectable()
export class RemotePostConfigService {
  private readonly logger = new Logger(RemotePostConfigService.name);
  private config: PostConfig = FALLBACK_CONFIG;
  private loading?: Promise<void>;

  current(): PostConfig {
    // Module options 拿到的是當下 snapshot，不會因為來源稍後更新而跟著變。
    return { ...this.config };
  }

  async load(): Promise<PostConfig> {
    this.loading ??= this.fetchRemoteConfig();
    await this.loading;
    return this.current();
  }

  private async fetchRemoteConfig(): Promise<void> {
    this.logger.log('Fetching remote post config');
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    this.config = REMOTE_CONFIG;
    this.logger.log('Remote post config loaded');
  }
}
