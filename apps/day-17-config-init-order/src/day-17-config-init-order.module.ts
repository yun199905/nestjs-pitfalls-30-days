import { Module } from '@nestjs/common';
import { Day17ConfigInitOrderController } from './day-17-config-init-order.controller';
import { Day17ConfigInitOrderService } from './day-17-config-init-order.service';

@Module({
  imports: [],
  controllers: [Day17ConfigInitOrderController],
  providers: [Day17ConfigInitOrderService],
})
export class Day17ConfigInitOrderModule {}
