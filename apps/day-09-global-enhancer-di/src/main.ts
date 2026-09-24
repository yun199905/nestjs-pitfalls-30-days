import { NestFactory, Reflector } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { UserRolesService } from './auth/user-roles.service';
import { Day09GlobalEnhancerDiModule } from './day-09-global-enhancer-di.module';

async function bootstrap() {
  const app = await NestFactory.create(Day09GlobalEnhancerDiModule);

  // 地雷：useGlobalGuards() 只負責「把某個 Guard 設為全域」，不負責建立它。
  // 這裡的 RolesGuard 是我們自己 new 的，所以 constructor 依賴也得自己準備，
  // main.ts 因此變成一份手寫的組裝清單——RolesGuard 每多一個依賴就要回來加一行。
  // 正確解法寫在 day-09-global-enhancer-di.module.ts 的註解裡。
  app.useGlobalGuards(
    new RolesGuard(app.get(Reflector), app.get(UserRolesService)),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
