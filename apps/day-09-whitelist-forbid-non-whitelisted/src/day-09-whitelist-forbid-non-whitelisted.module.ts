import { Module } from '@nestjs/common';
import { Day09WhitelistForbidNonWhitelistedController } from './day-09-whitelist-forbid-non-whitelisted.controller';
import { Day09WhitelistForbidNonWhitelistedService } from './day-09-whitelist-forbid-non-whitelisted.service';

@Module({
  imports: [],
  controllers: [Day09WhitelistForbidNonWhitelistedController],
  providers: [Day09WhitelistForbidNonWhitelistedService],
})
export class Day09WhitelistForbidNonWhitelistedModule {}
