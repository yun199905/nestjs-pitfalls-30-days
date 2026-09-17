import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostIdGeneratorService } from './posts/post-id-generator.service';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { CustomProviderModule } from './scenarios/02-custom-provider/custom-provider.module';
import { ModuleRefScenarioModule } from './scenarios/03-module-ref/module-ref.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // 排雷指南的兩個進階情境，與上面的主坑互不干擾
    CustomProviderModule, // 情境二：依設定選擇實作
    ModuleRefScenarioModule, // 情境三：執行期向容器查找 provider
  ],
  controllers: [PostsController],
  providers: [PostIdGeneratorService, PostsService],
})
export class Day03ManualNewServiceModule {}
