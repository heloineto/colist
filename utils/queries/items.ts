import type { Tables } from '../supabase/database-types';
import type { CategoryBase } from './categories';
import { CATEGORIES_COLUMNS_BASE } from './categories';

export type ItemBase = Tables<'items'>;
export type Item = ItemBase & {
  category: CategoryBase | null;
};

export const ITEMS_TABLE = 'items';
export const ITEMS_COLUMNS_BASE = `
  id,
  created,
  name,
  amount,
  checked,
  details,
  categoryId,
  listId
`;
export const ITEMS_COLUMNS = `
  ${ITEMS_COLUMNS_BASE},
  category:categories ( ${CATEGORIES_COLUMNS_BASE} )
`;
