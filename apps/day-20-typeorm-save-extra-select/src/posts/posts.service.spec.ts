import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  const postsRepository = {
    save: jest.fn(),
    update: jest.fn(),
  };
  const service = new PostsService(
    postsRepository as unknown as Repository<Post>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates the entity-shaped write to save()', async () => {
    postsRepository.save.mockResolvedValue({ id: 1, title: '新標題' });

    await expect(service.saveTitle(1, '新標題')).resolves.toEqual({
      id: 1,
      title: '新標題',
    });
    expect(postsRepository.save).toHaveBeenCalledWith({
      id: 1,
      title: '新標題',
    });
  });

  it('checks the affected row count after update()', async () => {
    postsRepository.update.mockResolvedValue({ affected: 0 });

    await expect(service.updateTitle(999, '新標題')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
