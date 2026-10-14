import { Module } from '@nestjs/common';
import { Day29SwaggerComplexTypesController } from './day-29-swagger-complex-types.controller';
import { Day29SwaggerComplexTypesService } from './day-29-swagger-complex-types.service';

@Module({
  imports: [],
  controllers: [Day29SwaggerComplexTypesController],
  providers: [Day29SwaggerComplexTypesService],
})
export class Day29SwaggerComplexTypesModule {}
