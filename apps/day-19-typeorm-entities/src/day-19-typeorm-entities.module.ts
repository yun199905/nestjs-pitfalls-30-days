import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Day19TypeormEntitiesController } from './day-19-typeorm-entities.controller';
import { Day19TypeormEntitiesService } from './day-19-typeorm-entities.service';
import { UsersModule } from './users/users.module';
// import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      // 地雷：這裡故意將 entities 設為空陣列，也沒有設 autoLoadEntities: true
      entities: [],
      // 解法一：手動註冊 Entity
      // entities: [User],
      // 解法二： 使用 glob 路徑，自動載入符合檔名規則的 Entity
      // entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // 解法三：讓 TypeORM 自動載入所有註冊的 Entity（經過 forFeature() 註冊的 Entity）
      // autoLoadEntities: true,
    }),
    UsersModule,
  ],
  controllers: [Day19TypeormEntitiesController],
  providers: [Day19TypeormEntitiesService],
})
export class Day19TypeormEntitiesModule {}
