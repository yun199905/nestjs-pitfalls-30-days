import { Module } from '@nestjs/common';
import { Day20ConfigOutsideDiController } from './day-20-config-outside-di.controller';
import { Day20ConfigOutsideDiService } from './day-20-config-outside-di.service';

@Module({
  imports: [],
  controllers: [Day20ConfigOutsideDiController],
  providers: [Day20ConfigOutsideDiService],
})
export class Day20ConfigOutsideDiModule {}
