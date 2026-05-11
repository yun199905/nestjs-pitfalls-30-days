import { Injectable } from '@nestjs/common';

@Injectable()
export class Day28UnhandledPromiseRejectService {
  getHello(): string {
    return 'Hello World!';
  }
}
