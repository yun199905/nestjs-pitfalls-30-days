import { Injectable } from '@nestjs/common';
import type { UpdatePostBody } from './dto/request/update-post-body.dto';
import type {
  UpdatePostResponse,
  UpdatePostVariant,
} from './dto/response/update-post-response.dto';

@Injectable()
export class Day24SwaggerApiPropertyService {
  update(
    id: string,
    variant: UpdatePostVariant,
    body: UpdatePostBody,
  ): UpdatePostResponse {
    return {
      id,
      variant,
      ...body,
    };
  }
}
