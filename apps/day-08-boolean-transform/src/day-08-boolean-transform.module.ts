import { Module } from '@nestjs/common';
import { Day08BooleanTransformController } from './day-08-boolean-transform.controller';
import { Day08BooleanTransformService } from './day-08-boolean-transform.service';

@Module({
  imports: [],
  controllers: [Day08BooleanTransformController],
  providers: [Day08BooleanTransformService],
})
export class Day08BooleanTransformModule {}
