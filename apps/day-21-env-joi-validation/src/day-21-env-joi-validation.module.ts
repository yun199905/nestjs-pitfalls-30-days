import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
// 解法二：使用 custom validate 時，取消下一行註解
// import { validateEnvironment } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/day-21-env-joi-validation/.env.example',
      validatePredefined: false,
      validationSchema: Joi.object({
        // 解法一：取消下一行註解，讓 Joi 在啟動時轉型並驗證 PORT
        // PORT: Joi.number().port().default(3000),
      }),
      // 解法二：先註解整個 validationSchema，再取消下一行註解
      // validate: validateEnvironment,
      // @nestjs/config 4.x 會優先執行 validate，但練習刻意一次只啟用一種解法
    }),
  ],
})
export class Day21EnvJoiValidationModule {}
