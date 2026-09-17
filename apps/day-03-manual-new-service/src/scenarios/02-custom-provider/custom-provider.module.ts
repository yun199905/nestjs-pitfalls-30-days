import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomProviderController } from './custom-provider.controller';
import { CustomProviderPostsService } from './custom-provider-posts.service';
import {
  POST_ID_GENERATOR,
  type PostIdGenerator,
} from './post-id-generator.token';
import { SequentialPostIdGenerator } from './sequential-post-id-generator';
import { UuidPostIdGenerator } from './uuid-post-id-generator';

@Module({
  imports: [ConfigModule],
  controllers: [CustomProviderController],
  providers: [
    // 兩個實作都交給容器建立與管理，factory 只負責「挑一個」。
    UuidPostIdGenerator,
    SequentialPostIdGenerator,
    {
      provide: POST_ID_GENERATOR,
      inject: [ConfigService, UuidPostIdGenerator, SequentialPostIdGenerator],
      useFactory: (
        configService: ConfigService,
        uuidGenerator: UuidPostIdGenerator,
        sequentialGenerator: SequentialPostIdGenerator,
      ): PostIdGenerator =>
        configService.get<string>('POST_ID_TYPE') === 'uuid'
          ? uuidGenerator
          : sequentialGenerator,
    },
    CustomProviderPostsService,
  ],
})
export class CustomProviderModule {}
