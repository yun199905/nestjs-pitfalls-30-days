import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Day24ResponseHandlingController } from './day-24-response-handling.controller';
import { EnvelopeInterceptor } from './envelope.interceptor';

@Module({
  controllers: [Day24ResponseHandlingController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: EnvelopeInterceptor,
    },
  ],
})
export class Day24ResponseHandlingModule {}
