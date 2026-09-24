import { Module } from '@nestjs/common';
import { Day10DynamicRouteController } from './day-10-dynamic-route.controller';
import { Day10DynamicRouteService } from './day-10-dynamic-route.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [Day10DynamicRouteController],
  providers: [Day10DynamicRouteService],
})
export class Day10DynamicRouteModule {}
