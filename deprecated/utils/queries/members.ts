import type { Tables } from '../supabase/database-types';
import type { Profile } from './profiles';
import { PROFILES_COLUMNS } from './profiles';

export type MemberBase = Tables<'members'>;
export type Member = MemberBase & {
  profile: Profile | null;
};

export const MEMBERS_TABLE = 'members';
export const MEMBERS_COLUMNS_BASE = `
  profileId,
  listId,
  role
`;
export const MEMBERS_COLUMNS = `
  ${MEMBERS_COLUMNS_BASE},
  profile:profiles ( ${PROFILES_COLUMNS} )
`;
