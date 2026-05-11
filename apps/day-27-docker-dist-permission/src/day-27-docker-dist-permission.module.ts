import { Module } from '@nestjs/common';
import { Day27DockerDistPermissionController } from './day-27-docker-dist-permission.controller';
import { Day27DockerDistPermissionService } from './day-27-docker-dist-permission.service';

@Module({
  imports: [],
  controllers: [Day27DockerDistPermissionController],
  providers: [Day27DockerDistPermissionService],
})
export class Day27DockerDistPermissionModule {}
