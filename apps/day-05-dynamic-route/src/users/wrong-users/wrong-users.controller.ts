import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from '../users.service';

@Controller('wrong-users')
export class WrongUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getUserById(@Param('id') userId: string) {
    return this.usersService.getUserById(userId);
  }

  // ❌ 動態路由宣告在前，會把 'profile' 當作 :id 吃掉
  @Get('profile')
  getProfile() {
    return this.usersService.getProfile();
  }
}
