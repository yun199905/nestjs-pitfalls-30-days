export interface UpdatePostBody {
  title?: string;
  content?: string;
  tags?: string[];
  publishOptions?: {
    notifyFollowers: boolean;
  };
}
