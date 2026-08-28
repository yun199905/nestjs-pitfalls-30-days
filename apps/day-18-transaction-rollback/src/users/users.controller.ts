import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: '查看 YUN 的文章計數是否被正確 rollback',
    description:
      '初始 postCount 為 0；錯誤版本執行後會變成 1，兩個修正版則會維持 0。',
  })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
