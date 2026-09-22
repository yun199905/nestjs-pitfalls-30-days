import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [SharedModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class ExplicitContextScenarioModule {}
