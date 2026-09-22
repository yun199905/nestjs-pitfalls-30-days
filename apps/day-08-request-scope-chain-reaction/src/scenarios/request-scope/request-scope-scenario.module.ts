import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { RequestContextService } from './request-context.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [SharedModule],
  controllers: [PostsController],
  providers: [RequestContextService, PostsService],
})
export class RequestScopeScenarioModule {}
