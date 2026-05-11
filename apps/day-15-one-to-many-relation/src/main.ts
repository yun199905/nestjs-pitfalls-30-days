import { NestFactory } from '@nestjs/core';
import { Day15OneToManyRelationModule } from './day-15-one-to-many-relation.module';

async function bootstrap() {
  const app = await NestFactory.create(Day15OneToManyRelationModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
