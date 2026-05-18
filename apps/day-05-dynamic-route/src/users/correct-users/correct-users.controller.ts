import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from '../users.service';

@Controller('correct-users')
export class CorrectUsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('profile')
  getProfile() {
    return this.usersService.getProfile();
  }

  @Get(':id')
  getUserById(@Param('id') userId: string) {
    return this.usersService.getUserById(userId);
  }
}
