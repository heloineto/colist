import { notifications } from '@mantine/notifications';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import i18next from 'i18next';
import { ApiError } from '@/shared/api/fetcher';
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
    title: i18next.t('errors.title'),
    message: describe(error),
    color: 'red',
  });
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
