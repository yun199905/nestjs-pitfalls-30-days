import { NestFactory } from '@nestjs/core';
import { Day26ControllerFilterSkipsGlobalModule } from './day-26-controller-filter-skips-global.module';

async function bootstrap() {
  const app = await NestFactory.create(Day26ControllerFilterSkipsGlobalModule);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
