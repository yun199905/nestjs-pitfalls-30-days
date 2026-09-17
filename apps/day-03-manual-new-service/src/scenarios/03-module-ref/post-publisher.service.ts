import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DraftPostPublisher } from './draft-post-publisher.service';
import type { PublishMode, PublishResult } from './post-publisher.interface';
import { PublicPostPublisher } from './public-post-publisher.service';

@Injectable()
export class PostPublisher {
  constructor(private readonly moduleRef: ModuleRef) {}

  publish(mode: PublishMode): PublishResult {
    // 向容器索取已註冊的 provider，而不是自己 new。
    // 拿到的是容器管理的那一份，所以 singleton、lifecycle、override 都還在。
    const publisher =
      mode === 'draft'
        ? this.moduleRef.get(DraftPostPublisher)
        : this.moduleRef.get(PublicPostPublisher);

    // 若目標是 REQUEST / TRANSIENT scope，get() 會拋錯，必須改用非同步的 resolve()：
    // const publisher = await this.moduleRef.resolve(SomeScopedPublisher);

    return publisher.publish();
  }
}
