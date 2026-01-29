import { type Tables } from '../supabase/database-types';
import { type ProfileBase, PROFILES_COLUMNS_BASE } from './profiles';

export type ErrorBase = Tables<'errors'>;
export type Error = ErrorBase & {
  profile: ProfileBase | null;
};

export const ERRORS_TABLE = 'errors';
export const ERRORS_COLUMNS_BASE = `
  id,
  created,
  message,
  allowCommunication,
  error,
  profileId
`;
export const ERRORS_COLUMNS = `
  ${ERRORS_COLUMNS_BASE},
  profile:profiles ( ${PROFILES_COLUMNS_BASE} )
` as const;
