import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
// import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { FakeAuthenticationMiddleware } from './auth/fake-authentication.middleware';
// import { RolesGuard } from './auth/roles.guard';
import { UserRolesService } from './auth/user-roles.service';

@Module({
  controllers: [AppController],
  providers: [
    UserRolesService,
    // 正確解法：把「建立 RolesGuard」這件事交還給 Nest container。
    // container 會讀 constructor，自己備好 Reflector 與 UserRolesService，
    // main.ts 從此不必維護任何組裝清單。
    // 取消下面的註解後，記得一併移除 main.ts 的手動註冊，
    // 否則兩種註冊方式會同時生效。
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class Day09GlobalEnhancerDiModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(FakeAuthenticationMiddleware).forRoutes(AppController);
  }
}
