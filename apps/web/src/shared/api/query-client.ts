import { notifications } from '@mantine/notifications';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import i18next from 'i18next';
import { ApiError } from '@/shared/api/fetcher';
import { invalidateActivities } from '@/shared/api/generated/activities/activities';
import { invalidateCategories } from '@/shared/api/generated/categories/categories';
import { invalidateItems } from '@/shared/api/generated/items/items';
import { invalidateLists as invalidateListsIndex } from '@/shared/api/generated/lists/lists';
import { invalidateMemberships } from '@/shared/api/generated/memberships/memberships';
import { CONTENT_MUTATION_KEYS } from '@/shared/api/offline';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { silent?: boolean; success?: string };
    queryMeta: { silent?: boolean };
  }
}

/** Persisted-cache lifetime; query `gcTime` must be at least this. */
export const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function describe(error: unknown) {
  // fetch rejects with TypeError when the network is unreachable
  if (error instanceof TypeError) return i18next.t('errors.offline');
  if (error instanceof ApiError && error.status === 404) {
    return i18next.t('errors.notFound');
  }
  if (error instanceof ApiError && error.status === 403) {
    return i18next.t('errors.forbidden');
  }
  return i18next.t('errors.unexpected');
}

export function showError(error: unknown) {
  notifications.show({
    // one offline toast, however many requests fail (`show` ignores a live id)
    id: error instanceof TypeError ? 'offline' : undefined,
    title: i18next.t('errors.title'),
    message: describe(error),
    color: 'red',
  });
}

/** Coarse invalidation: everything scoped to one list, plus the lists index (badges, names). */
export function invalidateList(listId: number) {
  void invalidateItems(queryClient, listId);
  void invalidateCategories(queryClient, listId);
  void invalidateMemberships(queryClient, listId);
  void invalidateActivities(queryClient, listId);
  void invalidateListsIndex(queryClient);
}

export function invalidateLists() {
  void invalidateListsIndex(queryClient);
}

/** Generated mutations carry path params in `variables`; a `listId` scopes the refetch. */
function invalidateAfter(variables: unknown) {
  const listId = (variables as { listId?: unknown } | undefined)?.listId;
  if (typeof listId === 'number') invalidateList(listId);
  else invalidateLists();
}

/** Queued op against a deleted target: dropped per LWW (ticket 09), no toast. */
function isDroppedQueueOp(error: unknown, mutationKey: readonly unknown[]) {
  if (!(error instanceof ApiError) || error.status !== 404) return false;
  const head = mutationKey[0];
  return typeof head === 'string' && CONTENT_MUTATION_KEYS.includes(head);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10_000, retry: 1, gcTime: CACHE_MAX_AGE },
    // Fail fast offline; content ops override this to queue (offline.ts).
    mutations: { networkMode: 'always' },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (!query.meta?.silent) showError(error);
    },
  }),
  mutationCache: new MutationCache({
    // Every mutation triggers a refetch of what it could have touched; SSE covers other members.
    onSettled: (_data, _error, variables) => invalidateAfter(variables),
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent) return;
      if (isDroppedQueueOp(error, mutation.options.mutationKey ?? [])) return;
      showError(error);
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = mutation.meta?.success;
      if (message) notifications.show({ message, color: 'green' });
    },
  }),
});
