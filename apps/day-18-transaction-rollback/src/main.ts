import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Day18TransactionRollbackModule } from './day-18-transaction-rollback.module';

async function bootstrap() {
  const app = await NestFactory.create(Day18TransactionRollbackModule);

  const config = new DocumentBuilder()
    .setTitle('Day 18｜交易邊界與 rollback')
    .setDescription(
      'transaction() 不會自動把 EntityManager 傳給其他 service。四個 posts 端點分別示範：' +
        '使用預設 Repository 的地雷、傳遞 EntityManager、手動 QueryRunner，以及忘記 release()。' +
        '用 GET /users 觀察新增 Post 失敗後，作者的 postCount 是否正確回滾。',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
