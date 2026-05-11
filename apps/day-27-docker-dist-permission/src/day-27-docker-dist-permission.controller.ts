import { Controller, Get } from '@nestjs/common';
import { Day27DockerDistPermissionService } from './day-27-docker-dist-permission.service';

@Controller()
export class Day27DockerDistPermissionController {
  constructor(private readonly day27DockerDistPermissionService: Day27DockerDistPermissionService) {}

  @Get()
  getHello(): string {
    return this.day27DockerDistPermissionService.getHello();
  }
}
