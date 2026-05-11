import { Injectable } from '@nestjs/common';

@Injectable()
export class Day16LazyLoadingNPlusOneService {
  getHello(): string {
    return 'Hello World!';
  }
}
