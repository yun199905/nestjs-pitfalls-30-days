import { NestFactory } from '@nestjs/core';
import { Day09WhitelistForbidNonWhitelistedModule } from './day-09-whitelist-forbid-non-whitelisted.module';

async function bootstrap() {
  const app = await NestFactory.create(Day09WhitelistForbidNonWhitelistedModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
