import { NestFactory } from '@nestjs/core';
import { Day27DockerDistPermissionModule } from './day-27-docker-dist-permission.module';

async function bootstrap() {
  const app = await NestFactory.create(Day27DockerDistPermissionModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
