import { Injectable } from '@nestjs/common';

@Injectable()
export class Day21LazyLoadingNPlusOneService {
  getHello(): string {
    return 'Hello World!';
  }
}
