import { Module } from '@nestjs/common';
import { Day24SwaggerApiPropertyController } from './day-24-swagger-api-property.controller';
import { Day24SwaggerApiPropertyService } from './day-24-swagger-api-property.service';

@Module({
  imports: [],
  controllers: [Day24SwaggerApiPropertyController],
  providers: [Day24SwaggerApiPropertyService],
})
export class Day24SwaggerApiPropertyModule {}
