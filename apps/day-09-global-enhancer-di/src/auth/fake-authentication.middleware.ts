import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './authenticated-request';

// 模擬「認證已經完成」這一步。實務上會是 JWT 或 session 驗證，
// 這裡直接把標頭當成驗證結果，好讓 RolesGuard 專心示範授權。
@Injectable()
export class FakeAuthenticationMiddleware implements NestMiddleware {
  use(
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ): void {
    const userId = Number(request.headers['x-user-id']);

    request.user = Number.isNaN(userId) ? undefined : { id: userId };

    next();
  }
}
