import { Injectable, OnModuleInit } from '@nestjs/common';
import { PostIdGeneratorService } from './post-id-generator.service';

export interface CreatedPost {
  id: string;
  title: string;
  initializedByNest: boolean;
}

@Injectable()
export class PostsService implements OnModuleInit {
  private initializedByNest = false;

  constructor(
    private readonly postIdGeneratorService: PostIdGeneratorService,
  ) {}

  onModuleInit(): void {
    this.initializedByNest = true;
  }

  create(title: string): CreatedPost {
    return {
      id: this.postIdGeneratorService.next(),
      title,
      initializedByNest: this.initializedByNest,
    };
  }
}
