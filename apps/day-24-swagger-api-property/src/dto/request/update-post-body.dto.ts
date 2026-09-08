export interface UpdatePostBody {
  title?: string;
  content?: string;
  tags?: string[];
  relatedPostIds?: number[];
  publishOptions?: {
    notifyFollowers: boolean;
  };
}
