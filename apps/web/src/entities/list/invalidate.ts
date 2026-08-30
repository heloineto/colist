import { queryClient } from '@/shared/api/query-client';
import { getListsQueryKey } from '@/shared/api/generated/lists/lists';

/** Coarse invalidation: everything scoped to one list, plus the lists index (badges, names). */
export function invalidateList(listId: number) {
  void queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/items`] });
  void queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/categories`] });
  void queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/memberships`] });
  void queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/activities`] });
  void queryClient.invalidateQueries({ queryKey: getListsQueryKey() });
}

export function invalidateLists() {
  void queryClient.invalidateQueries({ queryKey: getListsQueryKey() });
}
