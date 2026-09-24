import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { WrongUsersController } from './wrong-users/wrong-users.controller';
import { CorrectUsersController } from './correct-users/correct-users.controller';

@Module({
  providers: [UsersService],
  controllers: [WrongUsersController, CorrectUsersController]
})
export class UsersModule {}
