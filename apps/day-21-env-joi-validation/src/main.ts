import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Day21EnvJoiValidationModule } from './day-21-env-joi-validation.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    Day21EnvJoiValidationModule,
    { logger: false },
  );
  const configService = app.get(ConfigService);
  const rawPort = process.env.PORT;
  const configPort = configService.get<number>('PORT');

  console.table([
    {
      source: 'process.env.PORT',
      value: rawPort,
      runtimeType: typeof rawPort,
      nextPort: rawPort + 1,
    },
    {
      source: "configService.get<number>('PORT')",
      value: configPort,
      runtimeType: typeof configPort,
      nextPort: configPort + 1,
    },
  ]);

  await app.close();
}
void bootstrap();
