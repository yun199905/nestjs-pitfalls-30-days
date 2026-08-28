import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // SQLite：測試錯誤交易被共用 QueryRunner 掩蓋的情況。
    // 切換時必須同時註解下方 PostgreSQL 設定，避免註冊兩個預設 DataSource。
    /*
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      autoLoadEntities: true,
      logging: true,
    }),
    */

    // PostgreSQL：預設啟用，用來呈現真正的跨連線交易邊界。
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'day18',
      synchronize: true,
      autoLoadEntities: true,
      logging: true,
      extra: {
        // 故意把連線池調到很小，忘記 release() 的後果幾次請求就看得到。
        max: 2,
      },
    }),
    UsersModule,
    PostsModule,
  ],
})
export class Day18TransactionRollbackModule {}
