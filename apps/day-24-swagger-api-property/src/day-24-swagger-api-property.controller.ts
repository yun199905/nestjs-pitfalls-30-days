import { Controller, Get } from '@nestjs/common';
import { Day24SwaggerApiPropertyService } from './day-24-swagger-api-property.service';

@Controller()
export class Day24SwaggerApiPropertyController {
  constructor(private readonly day24SwaggerApiPropertyService: Day24SwaggerApiPropertyService) {}

  @Get()
  getHello(): string {
    return this.day24SwaggerApiPropertyService.getHello();
  }
}
