import { notifications } from '@mantine/notifications';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import i18next from 'i18next';
import { ApiError } from '@/shared/api/fetcher';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { silent?: boolean; success?: string };
    queryMeta: { silent?: boolean };
  }
}

function describe(error: unknown) {
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

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (!query.meta?.silent) showError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (!mutation.meta?.silent) showError(error);
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = mutation.meta?.success;
      if (message) notifications.show({ message, color: 'green' });
    },
  }),
});
