import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { InstanceTrackerService } from '../../shared/instance-tracker.service';

const MISSING_REQUEST_ID = 'request-id-not-provided';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  readonly instanceId: string;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    instanceTracker: InstanceTrackerService,
  ) {
    this.instanceId = instanceTracker.nextId('request-context');
  }

  getRequestId(): string {
    const requestId = this.request.headers['x-request-id'];

    if (Array.isArray(requestId)) {
      return requestId[0] ?? MISSING_REQUEST_ID;
    }

    return requestId ?? MISSING_REQUEST_ID;
  }
}
