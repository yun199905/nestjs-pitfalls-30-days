import { Injectable } from '@nestjs/common';

@Injectable()
export class Day10DynamicRouteService {
  getHello(): string {
    return 'Hello World!';
  }
}
