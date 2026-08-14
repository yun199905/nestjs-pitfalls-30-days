import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Day15LazyLoadingNPlusOneController } from './day-15-lazy-loading-n-plus-one.controller';
import { Day15LazyLoadingNPlusOneService } from './day-15-lazy-loading-n-plus-one.service';
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
  controllers: [Day15LazyLoadingNPlusOneController],
  providers: [Day15LazyLoadingNPlusOneService],
})
export class Day15LazyLoadingNPlusOneModule {}
