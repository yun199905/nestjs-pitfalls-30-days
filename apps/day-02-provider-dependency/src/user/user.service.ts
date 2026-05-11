import { Injectable } from '@nestjs/common';
import { PostService } from '../post/post.service';

@Injectable()
export class UserService {
  constructor(private readonly postService: PostService) {}
}
