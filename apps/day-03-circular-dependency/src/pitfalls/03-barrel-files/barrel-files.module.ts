import { Module } from '@nestjs/common';
// 模擬開發者習慣從 index 引入
import { BarrelAService, BarrelBService } from '.';

@Module({
  providers: [BarrelAService, BarrelBService],
})
export class BarrelFilesModule {}
