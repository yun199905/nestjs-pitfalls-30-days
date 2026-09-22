import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { LoggerService } from './logger.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [SharedModule],
  controllers: [PostsController],
  providers: [LoggerService, PostsService],
})
export class TransientScopeScenarioModule {}
