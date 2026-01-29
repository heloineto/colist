import { createSafeContext } from '@mantine/core';
import type { UseMutationResult } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';
import type { TablesUpdate } from '@/deprecated/utils/supabase/database-types';
import type { Item } from '@/deprecated/utils/queries/items';

interface ItemsContext {
  search: string;
  openAmountModal: (item: Item) => void;
  updateMutation: UseMutationResult<
    Item | null,
    PostgrestError,
    TablesUpdate<'items'>
  >;
}

export const [ItemsProvider, useItemsContext] = createSafeContext<ItemsContext>(
  'ItemsProvider component was not found in the tree'
);
