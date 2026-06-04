import { Injectable } from '@nestjs/common';

@Injectable()
export class PostService {
  createPost(userId: string, content: string) {
    return {
      message: 'Post created successfully.',
      post: {
        id: 'post-1',
        userId,
        content,
      },
      note: 'This route is designed for cross-origin requests that include credentials such as cookies.',
    };
  }
}
