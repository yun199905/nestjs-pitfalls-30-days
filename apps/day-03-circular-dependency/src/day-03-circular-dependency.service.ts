import { Injectable } from '@nestjs/common';

@Injectable()
export class Day03CircularDependencyService {
  getHello(): string {
    return 'Hello World!';
  }
}
