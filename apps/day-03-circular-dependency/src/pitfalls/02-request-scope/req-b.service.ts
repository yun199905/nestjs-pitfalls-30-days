import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common';
import { ReqAService } from './req-a.service';

@Injectable({ scope: Scope.REQUEST })
export class ReqBService {
  // 記錄 constructor 階段讀到的 A.token，與 handler 階段的值對比使用。
  private readonly tokenAtConstruct?: string;

  constructor(
    @Inject(forwardRef(() => ReqAService))
    private readonly aService: ReqAService,
  ) {
    console.log('[Scope Pitfall] ReqBService 實例化');

    // 💣 A 已注入，但 token 尚未初始化，因此這裡通常會拿到 undefined。
    this.tokenAtConstruct = this.aService.getToken();
    console.log(
      '[Scope Pitfall] B constructor 讀到 A.token:',
      this.tokenAtConstruct,
    );
  }

  getTokenAtConstruct() {
    return this.tokenAtConstruct;
  }
}
