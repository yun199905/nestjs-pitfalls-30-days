import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Day21LazyLoadingNPlusOneController } from './day-21-lazy-loading-n-plus-one.controller';
import { Day21LazyLoadingNPlusOneService } from './day-21-lazy-loading-n-plus-one.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      autoLoadEntities: true,
      // 這篇教學的核心觀察工具：把每次查詢實際送出的 SQL 印在終端機
      logging: true,
    }),
    UsersModule,
  ],
  controllers: [Day21LazyLoadingNPlusOneController],
  providers: [Day21LazyLoadingNPlusOneService],
})
export class Day21LazyLoadingNPlusOneModule {}
