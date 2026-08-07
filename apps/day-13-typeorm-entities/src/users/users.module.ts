import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    // 延伸地雷：若忘記這行，Nest 無法建立 UsersService，應用程式會在啟動時出現：
    // Nest can't resolve dependencies of the UsersService (?).
    // Please make sure that the argument "UserRepository" is available in the UsersModule context.
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
