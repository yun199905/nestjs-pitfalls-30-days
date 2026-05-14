import { Module } from '@nestjs/common';
import { Day03CircularDependencyController } from './day-03-circular-dependency.controller';
import { Day03CircularDependencyService } from './day-03-circular-dependency.service';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';

// 進階情境挑戰區
// import { InitOrderModule } from './pitfalls/01-init-order/init-order.module';
// import { RequestScopeModule } from './pitfalls/02-request-scope/request-scope.module';
// import { BarrelFilesModule } from './pitfalls/03-barrel-files/barrel-files.module';

@Module({
  controllers: [Day03CircularDependencyController],
  providers: [Day03CircularDependencyService],
  imports: [
    UserModule,
    PostModule,

    // ⬇️ 進階情境挑戰區 (解開註解測試) ⬇️
    // InitOrderModule,     // 情境 1：觀察 Console 中的初始化順序混亂
    // RequestScopeModule,  // 情境 2：打 API 測試 Request Scope 時引發的崩潰
    // BarrelFilesModule,   // 情境 3：解除註解後，NestJS 可能連啟動都無法啟動
  ],
})
export class Day03CircularDependencyModule {}
