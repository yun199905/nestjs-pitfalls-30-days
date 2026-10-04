import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';
import { day20QueryRecorder } from './query-recorder.logger';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      autoLoadEntities: true,
      logging: ['query'],
      logger: day20QueryRecorder,
    }),
    PostsModule,
  ],
})
export class Day20TypeormSaveExtraSelectModule {}
