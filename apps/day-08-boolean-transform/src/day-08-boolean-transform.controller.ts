import { Controller, Get } from '@nestjs/common';
import { Day08BooleanTransformService } from './day-08-boolean-transform.service';

@Controller()
export class Day08BooleanTransformController {
  constructor(private readonly day08BooleanTransformService: Day08BooleanTransformService) {}

  @Get()
  getHello(): string {
    return this.day08BooleanTransformService.getHello();
  }
}
