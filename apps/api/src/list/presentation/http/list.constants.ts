import type { AuthenticatedRequest } from '@/iam/presentation/http/iam.constants';
import type { Membership } from '@/list/domain/membership';

export const REQUEST_MEMBERSHIP_KEY = 'membership';

export type ListRequest = AuthenticatedRequest & {
  [REQUEST_MEMBERSHIP_KEY]?: Membership;
};
