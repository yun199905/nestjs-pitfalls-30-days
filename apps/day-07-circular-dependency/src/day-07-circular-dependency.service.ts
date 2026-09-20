import { Injectable } from '@nestjs/common';

@Injectable()
export class Day07CircularDependencyService {
  getHello(): string {
    return 'Hello World!';
  }
}
