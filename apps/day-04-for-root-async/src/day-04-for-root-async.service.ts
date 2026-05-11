import { Injectable } from '@nestjs/common';

@Injectable()
export class Day04ForRootAsyncService {
  getHello(): string {
    return 'Hello World!';
  }
}
