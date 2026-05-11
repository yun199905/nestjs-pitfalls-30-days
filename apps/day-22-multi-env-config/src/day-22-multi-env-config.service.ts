import { Injectable } from '@nestjs/common';

@Injectable()
export class Day22MultiEnvConfigService {
  getHello(): string {
    return 'Hello World!';
  }
}
