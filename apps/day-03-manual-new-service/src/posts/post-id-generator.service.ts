import { Injectable } from '@nestjs/common';

@Injectable()
export class PostIdGeneratorService {
  private sequence = 0;

  next(): string {
    this.sequence += 1;
    return `post-${this.sequence}`;
  }
}
