import { Controller, Get } from '@nestjs/common';
import { Day15OneToManyRelationService } from './day-15-one-to-many-relation.service';

@Controller()
export class Day15OneToManyRelationController {
  constructor(private readonly day15OneToManyRelationService: Day15OneToManyRelationService) {}

  @Get()
  getHello(): string {
    return this.day15OneToManyRelationService.getHello();
  }
}
