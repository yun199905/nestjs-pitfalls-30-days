import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PostIdGenerator } from './post-id-generator.token';

@Injectable()
export class UuidPostIdGenerator implements PostIdGenerator {
  readonly kind = 'uuid' as const;

  next(): string {
    return randomUUID();
  }
}
