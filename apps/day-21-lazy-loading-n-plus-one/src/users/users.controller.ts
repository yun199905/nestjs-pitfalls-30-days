import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('manual-loop')
  findAllWithManualLoop() {
    return this.usersService.findAllWithManualLoop();
  }

  @Get('lazy-relation')
  findAllWithLazyRelation() {
    return this.usersService.findAllWithLazyRelation();
  }

  @Get('preloaded')
  findAllPreloaded() {
    return this.usersService.findAllPreloaded();
  }

  @Get('without-await')
  findAllWithoutAwait() {
    return this.usersService.findAllWithoutAwait();
  }
}
