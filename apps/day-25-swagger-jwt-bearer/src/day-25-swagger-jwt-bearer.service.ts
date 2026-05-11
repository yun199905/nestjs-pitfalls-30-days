import { Injectable } from '@nestjs/common';

@Injectable()
export class Day25SwaggerJwtBearerService {
  getHello(): string {
    return 'Hello World!';
  }
}
