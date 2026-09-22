import { Injectable, Scope } from '@nestjs/common';
import { InstanceTrackerService } from '../../shared/instance-tracker.service';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  readonly instanceId: string;
  private context = 'unknown';

  constructor(instanceTracker: InstanceTrackerService) {
    this.instanceId = instanceTracker.nextId('logger');
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string): void {
    console.log(`[${this.context}] ${message}`);
  }
}
