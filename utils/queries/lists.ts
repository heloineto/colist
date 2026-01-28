import type { Tables } from '../supabase/database-types';

export type ListBase = Tables<'lists'>;
export type List = ListBase;

export const LISTS_TABLE = 'lists';
export const LISTS_COLUMNS_BASE = `
  id,
  created,
  name
`;
export const LISTS_COLUMNS = LISTS_COLUMNS_BASE;
