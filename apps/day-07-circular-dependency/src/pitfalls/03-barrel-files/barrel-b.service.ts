import { Injectable } from '@nestjs/common';
// 直接引入沒問題，但 BarrelAService 透過 barrel 反過來引入了 BarrelBService，形成隱性循環
import { BarrelAService } from './barrel-a.service';

@Injectable()
export class BarrelBService {
  constructor(private readonly aService: BarrelAService) {}
}
