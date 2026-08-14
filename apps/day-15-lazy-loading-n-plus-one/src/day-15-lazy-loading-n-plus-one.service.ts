import { Injectable } from '@nestjs/common';

@Injectable()
export class Day15LazyLoadingNPlusOneService {
  getHello(): string {
    return 'Hello World!';
  }
}
