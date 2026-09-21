import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ReqBService } from './req-b.service';
import { RequestContextService } from './request-context.service';

@Injectable()
export class ReqAService {
  constructor(
    @Inject(forwardRef(() => ReqBService))
    private readonly bService: ReqBService,
    private readonly requestContext: RequestContextService,
  ) {}

  doSomething() {
    return {
      requestContextOnResolvedA: this.hasRequestContext(),
      reqBServiceOnResolvedA: this.bService !== undefined,
      // TypeScript 認為 bService 必然存在，但 request scope 與循環依賴的組合
      // 可能讓 Nest 在執行期交付 undefined。這裡刻意使用安全存取來回傳診斷結果。
      requestContextOnASeenFromB:
        this.bService?.canSeeARequestContext() ?? false,
    };
  }

  hasRequestContext() {
    return this.requestContext !== undefined;
  }
}
