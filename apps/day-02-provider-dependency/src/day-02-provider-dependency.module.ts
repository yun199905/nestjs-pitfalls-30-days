import { Module } from '@nestjs/common';
import { Day02ProviderDependencyController } from './day-02-provider-dependency.controller';
import { Day02ProviderDependencyService } from './day-02-provider-dependency.service';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [UserModule, PostModule],
  controllers: [Day02ProviderDependencyController],
  providers: [Day02ProviderDependencyService],
})
export class Day02ProviderDependencyModule {}
