import { Inject, Injectable } from '@nestjs/common';
import type { PostConfig } from './post-config.interface';

/**
 * 解法三：把設定改由 class 承載。
 * token 直接寫在參數上，調換兩個參數的順序時，@Inject() 會跟著一起移動，
 * 因此「位置錯位」這個錯誤在結構上不存在。
 */
@Injectable()
export class PostConfigService implements PostConfig {
  constructor(
    @Inject('POST_API_BASE_URL') readonly apiBaseUrl: string,
    @Inject('DEFAULT_AUTHOR') readonly defaultAuthor: string,
  ) {}
}
