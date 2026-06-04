import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post/post.controller';
import { PostService } from './post/post.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

describe('Day06CorsControllers', () => {
  let postController: PostController;
  let userController: UserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PostController, UserController],
      providers: [PostService, UserService],
    }).compile();

    postController = app.get<PostController>(PostController);
    userController = app.get<UserController>(UserController);
  });

  it('returns a fixed current user profile', () => {
    expect(userController.getCurrentUser()).toEqual({
      id: 'user-1',
      name: 'Cors Demo User',
      role: 'author',
      note: 'Pretend this profile is fetched with a cookie-based session from another origin.',
    });
  });

  it('creates a minimal demo post response', () => {
    expect(
      postController.createPost({
        userId: 'user-1',
        content: 'CORS request with credentials',
      }),
    ).toEqual({
      message: 'Post created successfully.',
      post: {
        id: 'post-1',
        userId: 'user-1',
        content: 'CORS request with credentials',
      },
      note: 'This route is designed for cross-origin requests that include credentials such as cookies.',
    });
  });
});
