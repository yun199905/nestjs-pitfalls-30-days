import { Injectable } from '@nestjs/common';

@Injectable()
export class Day05DynamicRouteService {
  getHello(): string {
    return 'Hello World!';
  }
}
