import { DynamicModule, Module } from '@nestjs/common';
import type { PostsModuleAsyncOptions } from './posts-module-async-options.interface';
import { POSTS_MODULE_OPTIONS } from './posts.constants';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({})
export class PostsModule {
  static forRootAsync(options: PostsModuleAsyncOptions): DynamicModule {
    return {
      module: PostsModule,
      imports: options.imports ?? [],
      controllers: [PostsController],
      providers: [
        {
          provide: POSTS_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
        PostsService,
      ],
      exports: [PostsService],
    };
  }
}
