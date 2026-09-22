import { Injectable } from '@nestjs/common';
import { InstanceTrackerService } from '../../shared/instance-tracker.service';
import { LoggerService } from './logger.service';
import { TransientScopeDemoResponse } from './transient-scope.types';

@Injectable()
export class PostsService {
  readonly instanceId: string;

  constructor(
    private readonly logger: LoggerService,
    instanceTracker: InstanceTrackerService,
  ) {
    this.instanceId = instanceTracker.nextId('transient-posts-service');
    this.logger.setContext('transient-posts-service');
  }

  findPost(
    controllerInstanceId: string,
    loggerInControllerInstanceId: string,
  ): TransientScopeDemoResponse {
    this.logger.log('findPost called');

    return {
      strategy: 'transient-scope',
      instances: {
        controller: controllerInstanceId,
        service: this.instanceId,
        loggerInController: loggerInControllerInstanceId,
        loggerInService: this.logger.instanceId,
      },
    };
  }
}
