import { Injectable } from '@nestjs/common';

@Injectable()
export class Day09WhitelistForbidNonWhitelistedService {
  getHello(): string {
    return 'Hello World!';
  }
}
