import { Injectable } from '@nestjs/common';

@Injectable()
export class Day02ProviderDependencyService {
  getHello(): string {
    return 'Hello World!';
  }
}
