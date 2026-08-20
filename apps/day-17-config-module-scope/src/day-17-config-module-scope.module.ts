import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      // 地雷：這個動態模組有自己的作用域，看不到根模組註冊的 ConfigModule
      // 解法一：補進這個模組自己的作用域
      // imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite' as const,
        database: configService.get<string>('DB_NAME'),
        synchronize: true,
        logging: configService.get<string>('DB_LOGGING') === 'true',
      }),
    }),
    ConfigModule.forRoot({
      // 解法二：改成全域可見，所有模組都拿得到
      // isGlobal: true,
    }),
  ],
})
export class Day17ConfigModuleScopeModule {}
