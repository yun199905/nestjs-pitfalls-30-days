import type { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
}

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
