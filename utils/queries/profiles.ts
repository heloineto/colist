import type { Tables } from '../supabase/database-types';

export type ProfileBase = Tables<'profiles'>;
export type Profile = ProfileBase;

export const PROFILES_TABLE = 'profiles';
export const PROFILES_COLUMNS_BASE = `
  id,
  created,
  name,
  email,
  picture
`;
export const PROFILES_COLUMNS = PROFILES_COLUMNS_BASE;
