import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';
import type { PostConfig } from './post-config.interface';

export interface PostsModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  inject?: FactoryProvider['inject'];
  useFactory: (...dependencies: any[]) => PostConfig | Promise<PostConfig>;
}
