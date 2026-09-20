import { Injectable } from '@nestjs/common';
// ❌ 刻意從 index.ts 引入，製造隱性迴圈
import { BarrelBService } from '.';

@Injectable()
export class BarrelAService {
  constructor(private readonly bService: BarrelBService) {}
}
