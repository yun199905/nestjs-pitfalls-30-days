import { Injectable } from '@nestjs/common';
import type { PostIdGenerator } from './post-id-generator.token';

@Injectable()
export class SequentialPostIdGenerator implements PostIdGenerator {
  readonly kind = 'sequential' as const;

  private sequence = 0;

  next(): string {
    this.sequence += 1;
    return `post-${this.sequence}`;
  }
}
