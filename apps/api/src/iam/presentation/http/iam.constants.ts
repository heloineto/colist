import type { Request } from 'express';
import type { ActiveUserType } from '@/iam/domain/active-user';

export const REQUEST_USER_KEY = 'user';

export type AuthenticatedRequest = Request & {
  [REQUEST_USER_KEY]?: ActiveUserType;
};
