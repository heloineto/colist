import type { QueryClient } from '@tanstack/react-query';
import {
  categoriesCreate,
  categoriesDelete,
  categoriesRename,
  getCategoriesCreateMutationKey,
  getCategoriesDeleteMutationKey,
  getCategoriesRenameMutationKey,
} from '@/shared/api/generated/categories/categories';
import type {
  CategoriesCreateMutationVariables,
  CategoriesDeleteMutationVariables,
  CategoriesRenameMutationVariables,
} from '@/shared/api/generated/categories/categories';
import {
  getItemsCreateMutationKey,
  getItemsDeleteMutationKey,
  getItemsQueryKey,
  getItemsUpdateMutationKey,
  itemsCreate,
  itemsDelete,
  itemsUpdate,
} from '@/shared/api/generated/items/items';
import type {
  ItemsCreateMutationVariables,
  ItemsDeleteMutationVariables,
  ItemsUpdateMutationVariables,
} from '@/shared/api/generated/items/items';
import type { ItemsDtoOutput } from '@/shared/api/generated/models';
import {
  appendItem,
  patchItem,
  removeItem,
} from '@/shared/api/optimistic-items';

/** Content ops queue while offline (ticket 09); everything else fails fast. */
export const CONTENT_MUTATION_KEYS: string[] = [
  getItemsCreateMutationKey()[0],
  getItemsUpdateMutationKey()[0],
  getItemsDeleteMutationKey()[0],
  getCategoriesCreateMutationKey()[0],
  getCategoriesRenameMutationKey()[0],
  getCategoriesDeleteMutationKey()[0],
];

/**
 * Pause (not fail) while offline; retry so a flaky reconnect keeps the op.
 * One scope so a reload-resumed queue replays in order (create before its edits).
 */
const queued = {
  networkMode: 'online',
  retry: 3,
  scope: { id: 'offline-content' },
} as const;

/**
 * Default mutation functions so paused mutations survive a reload
 * (`resumePausedMutations` re-runs them from the persisted variables), plus
 * optimistic item patches so offline edits are visible immediately.
 * ponytail: no rollback on error — the reconnect blanket invalidate
 * reconciles (LWW by server arrival, per ticket 09).
 */
export function registerOfflineMutations(queryClient: QueryClient) {
  const patchItems = (
    listId: number,
    patch: (items: ItemsDtoOutput) => ItemsDtoOutput
  ) => {
    const queryKey = getItemsQueryKey(listId);
    void queryClient.cancelQueries({ queryKey });
    queryClient.setQueriesData<ItemsDtoOutput>({ queryKey }, (items) =>
      items ? patch(items) : items
    );
  };

  queryClient.setMutationDefaults(getItemsCreateMutationKey(), {
    ...queued,
    mutationFn: ({ listId, data }: ItemsCreateMutationVariables) =>
      itemsCreate(listId, data),
    onMutate: ({ listId, data }: ItemsCreateMutationVariables) => {
      patchItems(listId, (items) => appendItem(items, listId, data));
    },
  });
  queryClient.setMutationDefaults(getItemsUpdateMutationKey(), {
    ...queued,
    mutationFn: ({ listId, itemId, data }: ItemsUpdateMutationVariables) =>
      itemsUpdate(listId, itemId, data),
    onMutate: ({ listId, itemId, data }: ItemsUpdateMutationVariables) => {
      patchItems(listId, (items) => patchItem(items, itemId, data));
    },
  });
  queryClient.setMutationDefaults(getItemsDeleteMutationKey(), {
    ...queued,
    mutationFn: ({ listId, itemId }: ItemsDeleteMutationVariables) =>
      itemsDelete(listId, itemId),
    onMutate: ({ listId, itemId }: ItemsDeleteMutationVariables) => {
      patchItems(listId, (items) => removeItem(items, itemId));
    },
  });

  // ponytail: categories queue without optimistic inserts — a temp id would
  // leak into item.categoryId FKs; they appear on reconnect instead.
  queryClient.setMutationDefaults(getCategoriesCreateMutationKey(), {
    ...queued,
    mutationFn: ({ listId, data }: CategoriesCreateMutationVariables) =>
      categoriesCreate(listId, data),
  });
  queryClient.setMutationDefaults(getCategoriesRenameMutationKey(), {
    ...queued,
    mutationFn: ({
      listId,
      categoryId,
      data,
    }: CategoriesRenameMutationVariables) =>
      categoriesRename(listId, categoryId, data),
  });
  queryClient.setMutationDefaults(getCategoriesDeleteMutationKey(), {
    ...queued,
    mutationFn: ({ listId, categoryId }: CategoriesDeleteMutationVariables) =>
      categoriesDelete(listId, categoryId),
  });
}
