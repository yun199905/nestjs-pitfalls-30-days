import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  data: T;
}

@Injectable()
export class EnvelopeInterceptor<T> implements NestInterceptor<
  T,
  ResponseEnvelope<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseEnvelope<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    // 這個 header 只用來證明：使用 @Res() 時，interceptor 仍然有進場。
    response.setHeader('x-envelope-interceptor', 'entered');

    return next.handle().pipe(map((data) => ({ data })));
  }
}
