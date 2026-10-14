import { Injectable } from '@nestjs/common';
import type {
  CreatePostResponse,
  PostVariant,
} from './dto/response/create-post-response.dto';

@Injectable()
export class Day29SwaggerComplexTypesService {
  create(variant: PostVariant, post: unknown): CreatePostResponse {
    return {
      variant,
      post,
    };
  }
}
