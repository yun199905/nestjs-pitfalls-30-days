import type { UpdatePostBody } from '../request/update-post-body.dto';

// 一支端點對一個坑，所以 variant 就是坑的名字。
export type UpdatePostVariant =
  | 'missing-decorator'
  | 'nested-interface'
  | 'plain-partial'
  | 'correct';

export interface UpdatePostResponse extends UpdatePostBody {
  id: string;
  variant: UpdatePostVariant;
}
