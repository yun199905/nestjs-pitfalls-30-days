import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Day03ManualNewServiceModule } from '../day-03-manual-new-service.module';
import { PostIdGeneratorService } from './post-id-generator.service';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  it('直接 new 出來的 Service 不會自動執行 Nest lifecycle hook', () => {
    const service = new PostsService(new PostIdGeneratorService());

    expect(service.create('Manual instance')).toEqual({
      id: 'post-1',
      title: 'Manual instance',
      initializedByNest: false,
    });
  });

  it('由 Nest container 管理的 Service 會在 app.init() 時執行 hook', async () => {
    const testingModule = await Test.createTestingModule({
      imports: [Day03ManualNewServiceModule],
    }).compile();
    const app: INestApplication = testingModule.createNestApplication();

    try {
      await app.init();
      const service = testingModule.get(PostsService);

      expect(service.create('Container instance')).toEqual({
        id: 'post-1',
        title: 'Container instance',
        initializedByNest: true,
      });
    } finally {
      await app.close();
    }
  });
});
