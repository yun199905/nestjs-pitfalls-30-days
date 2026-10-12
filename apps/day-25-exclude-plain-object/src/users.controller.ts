import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { UserProfileResponseDto } from './user-profile-response.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/profile/broken')
  getBrokenProfile(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.getProfileData(id);
  }

  @Get(':id/profile/fixed')
  getFixedProfile(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.getProfile(id);
  }
}
