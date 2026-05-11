import { Controller, Get } from '@nestjs/common';
import { Day09WhitelistForbidNonWhitelistedService } from './day-09-whitelist-forbid-non-whitelisted.service';

@Controller()
export class Day09WhitelistForbidNonWhitelistedController {
  constructor(private readonly day09WhitelistForbidNonWhitelistedService: Day09WhitelistForbidNonWhitelistedService) {}

  @Get()
  getHello(): string {
    return this.day09WhitelistForbidNonWhitelistedService.getHello();
  }
}
