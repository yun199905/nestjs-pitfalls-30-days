import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InitBService } from './init-b.service';

@Injectable()
export class InitAService implements OnModuleInit {
  public dataReady = false;

  constructor(
    @Inject(forwardRef(() => InitBService))
    private readonly bService: InitBService,
  ) {}

  onModuleInit() {
    this.dataReady = true;

    // 💣 陷阱示範：因為啟動順序不固定，如果 A 比 B 先初始化，這裡取 B 的 dataReady 就會是 false 甚至是未定義的行為
    console.log(
      `[Init Order Pitfall] InitAService 初始化中... 此時 B 狀態: ${this.bService.dataReady}`,
    );
  }
}
