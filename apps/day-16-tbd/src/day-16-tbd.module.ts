import { Module } from '@nestjs/common';
import { Day16TbdController } from './day-16-tbd.controller';
import { Day16TbdService } from './day-16-tbd.service';

@Module({
  imports: [],
  controllers: [Day16TbdController],
  providers: [Day16TbdService],
})
export class Day16TbdModule {}
