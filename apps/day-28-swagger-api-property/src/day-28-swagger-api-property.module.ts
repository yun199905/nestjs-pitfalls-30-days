import { Module } from '@nestjs/common';
import { Day28SwaggerApiPropertyController } from './day-28-swagger-api-property.controller';
import { Day28SwaggerApiPropertyService } from './day-28-swagger-api-property.service';

@Module({
  imports: [],
  controllers: [Day28SwaggerApiPropertyController],
  providers: [Day28SwaggerApiPropertyService],
})
export class Day28SwaggerApiPropertyModule {}
