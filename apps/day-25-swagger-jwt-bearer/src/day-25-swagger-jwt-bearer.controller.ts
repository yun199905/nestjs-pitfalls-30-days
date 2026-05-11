import { Controller, Get } from '@nestjs/common';
import { Day25SwaggerJwtBearerService } from './day-25-swagger-jwt-bearer.service';

@Controller()
export class Day25SwaggerJwtBearerController {
  constructor(private readonly day25SwaggerJwtBearerService: Day25SwaggerJwtBearerService) {}

  @Get()
  getHello(): string {
    return this.day25SwaggerJwtBearerService.getHello();
  }
}
