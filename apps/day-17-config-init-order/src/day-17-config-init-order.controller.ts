import { Controller, Get } from '@nestjs/common';
import { Day17ConfigInitOrderService } from './day-17-config-init-order.service';

@Controller()
export class Day17ConfigInitOrderController {
  constructor(private readonly day17ConfigInitOrderService: Day17ConfigInitOrderService) {}

  @Get()
  getHello(): string {
    return this.day17ConfigInitOrderService.getHello();
  }
}
