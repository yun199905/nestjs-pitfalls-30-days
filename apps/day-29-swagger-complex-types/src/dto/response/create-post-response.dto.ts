export type PostVariant = 'broken' | 'correct';

export interface CreatePostResponse {
  variant: PostVariant;
  post: unknown;
}
