import { Module } from '@nestjs/common';
import { Day15OneToManyRelationController } from './day-15-one-to-many-relation.controller';
import { Day15OneToManyRelationService } from './day-15-one-to-many-relation.service';

@Module({
  imports: [],
  controllers: [Day15OneToManyRelationController],
  providers: [Day15OneToManyRelationService],
})
export class Day15OneToManyRelationModule {}
