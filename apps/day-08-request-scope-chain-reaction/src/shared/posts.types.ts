export interface Post {
  id: number;
  title: string;
}

export interface ScopeDemoResponse {
  requestId: string;
  strategy: 'request-scope' | 'explicit-context';
  instances: {
    controller: string;
    service: string;
    requestContext: string | null;
    repository: string;
  };
  post: Post;
}
