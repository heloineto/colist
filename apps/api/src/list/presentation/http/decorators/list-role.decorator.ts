import { SetMetadata } from '@nestjs/common';
import type { MembershipRole } from '@/list/domain/membership';

export const LIST_ROLE_KEY = 'listRole';

/** Restrict a list-scoped route to a Membership role (owner-only by default). */
export const ListRole = (role: MembershipRole = 'owner') =>
  SetMetadata(LIST_ROLE_KEY, role);
