import { Module } from '@nestjs/common';
import { Day25SwaggerJwtBearerController } from './day-25-swagger-jwt-bearer.controller';
import { Day25SwaggerJwtBearerService } from './day-25-swagger-jwt-bearer.service';

@Module({
  imports: [],
  controllers: [Day25SwaggerJwtBearerController],
  providers: [Day25SwaggerJwtBearerService],
})
export class Day25SwaggerJwtBearerModule {}
