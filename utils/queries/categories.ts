import type { Tables } from '../supabase/database-types';

export type CategoryBase = Tables<'categories'>;
export type Category = CategoryBase;

export const CATEGORIES_TABLE = 'categories';
export const CATEGORIES_COLUMNS_BASE = `
  id,
  created,
  name,
  listId
`;
export const CATEGORIES_COLUMNS = CATEGORIES_COLUMNS_BASE;
