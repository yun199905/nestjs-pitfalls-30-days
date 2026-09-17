import { Inject, Injectable } from '@nestjs/common';
import {
  POST_ID_GENERATOR,
  type PostIdGenerator,
} from './post-id-generator.token';

export interface CustomProviderPost {
  id: string;
  title: string;
  generator: PostIdGenerator['kind'];
}

@Injectable()
export class CustomProviderPostsService {
  // 只依賴 token，不知道也不需要知道實際拿到哪個實作。
  constructor(
    @Inject(POST_ID_GENERATOR)
    private readonly postIdGenerator: PostIdGenerator,
  ) {}

  create(title: string): CustomProviderPost {
    return {
      id: this.postIdGenerator.next(),
      title,
      generator: this.postIdGenerator.kind,
    };
  }
}
