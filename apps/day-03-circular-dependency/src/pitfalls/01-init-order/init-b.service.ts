import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InitAService } from './init-a.service';

@Injectable()
export class InitBService implements OnModuleInit {
  public dataReady = false;

  constructor(
    @Inject(forwardRef(() => InitAService))
    private readonly aService: InitAService,
  ) {}

  onModuleInit() {
    this.dataReady = true;
    console.log(
      `[Init Order Pitfall] InitBService 初始化中... 此時 A 狀態: ${this.aService.dataReady}`,
    );
  }
}
