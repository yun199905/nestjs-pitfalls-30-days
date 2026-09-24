import { Controller, Get } from '@nestjs/common';
import { Role } from './auth/role.enum';
import { Roles } from './auth/roles.decorator';

@Controller()
export class AppController {
  @Get('profile')
  getProfile(): string {
    return 'No specific role required';
  }

  @Roles(Role.Admin)
  @Get('admin')
  getAdmin(): string {
    return 'Admin only';
  }
}
