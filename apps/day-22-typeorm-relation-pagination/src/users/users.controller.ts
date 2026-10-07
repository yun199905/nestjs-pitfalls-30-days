import { Controller, Get, Query } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('limit-offset')
  getWithLimitOffset(@Query() query: PaginationQueryDto) {
    return this.usersService.findWithLimitOffset(query.page, query.pageSize);
  }

  @Get('take-skip')
  getWithTakeSkip(@Query() query: PaginationQueryDto) {
    return this.usersService.findWithTakeSkip(query.page, query.pageSize);
  }

  @Get('order-by-relation')
  getOrderedByRelation(@Query() query: PaginationQueryDto) {
    return this.usersService.findOrderedByRelation(query.page, query.pageSize);
  }

  @Get('group-by-post-count')
  getGroupedByPostCount(@Query() query: PaginationQueryDto) {
    return this.usersService.findGroupedByPostCount(query.page, query.pageSize);
  }

  @Get('counts')
  getJoinCounts() {
    return this.usersService.getJoinCounts();
  }
}
