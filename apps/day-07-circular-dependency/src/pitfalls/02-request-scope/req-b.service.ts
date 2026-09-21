import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ReqAService } from './req-a.service';

@Injectable()
export class ReqBService {
  constructor(
    @Inject(forwardRef(() => ReqAService))
    private readonly aService: ReqAService,
  ) {}

  canSeeARequestContext() {
    return this.aService.hasRequestContext();
  }
}
