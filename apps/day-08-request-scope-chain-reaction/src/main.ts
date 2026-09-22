import { NestFactory } from '@nestjs/core';
import { Day08RequestScopeChainReactionModule } from './day-08-request-scope-chain-reaction.module';

async function bootstrap() {
  const app = await NestFactory.create(Day08RequestScopeChainReactionModule);
  await app.listen(process.env.port ?? 3000);
}

void bootstrap();
