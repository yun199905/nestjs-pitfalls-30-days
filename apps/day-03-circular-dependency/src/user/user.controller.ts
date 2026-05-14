import { Controller, Delete, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // DELETE /user/:id — 刪除帳號，並連帶刪除該用戶的所有貼文
  @Delete(':id')
  deleteAccount(@Param('id') id: string) {
    this.userService.deleteAccount(id);
    return { message: `User ${id} and their posts have been deleted.` };
  }
}
