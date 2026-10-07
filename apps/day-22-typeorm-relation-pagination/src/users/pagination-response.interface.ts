import { User } from './user.entity';

export interface PaginationResponse {
  data: User[];
  meta: {
    page: number;
    pageSize: number;
    currentPageCount: number;
    totalCount: number;
  };
}

export interface JoinCountsResponse {
  joinRowCount: number;
  distinctUserCount: number;
}
