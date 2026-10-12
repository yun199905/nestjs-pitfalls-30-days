import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [User, Post],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Post]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class Day25ExcludePlainObjectModule {}
