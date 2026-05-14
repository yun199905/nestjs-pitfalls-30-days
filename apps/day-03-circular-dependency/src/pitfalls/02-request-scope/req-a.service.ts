import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common';
import { ReqBService } from './req-b.service';

@Injectable({ scope: Scope.REQUEST })
export class ReqAService {
  // 刻意延後到 handler 才初始化，用來對比 B constructor 讀取時的時機差異。
  private token?: string;

  constructor(
    @Inject(forwardRef(() => ReqBService))
    private readonly bService: ReqBService,
  ) {
    console.log('[Scope Pitfall] ReqAService 實例化');
  }

  doSomething() {
    // handler 階段才初始化：此時 B 的 constructor 早已執行完畢。
    this.token = `req-${Date.now()}`;

    return {
      // 💣 核心雷點：B 在 constructor 快照的值，因為時機太早通常為 undefined。
      tokenAtBConstruct: this.bService.getTokenAtConstruct(),
      // 對照組：handler 此刻讀到 A 的值，已正確初始化。
      tokenAtHandler: this.token,
    };
  }

  getToken() {
    return this.token;
  }
}
