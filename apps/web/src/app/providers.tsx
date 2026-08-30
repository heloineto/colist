import {
  Checkbox,
  HoverCard,
  MantineProvider,
  Modal,
  Tooltip,
  createTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';
import type { ReactNode } from 'react';
import { registerOfflineMutations } from '@/shared/api/offline';
import { CACHE_MAX_AGE, queryClient } from '@/shared/api/query-client';
import { usePrimaryColor } from '@/shared/lib/preferences';

registerOfflineMutations(queryClient);

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key: string) => get<string>(key),
    setItem: (key: string, value: string) => set(key, value),
    removeItem: (key: string) => del(key),
  },
});

const baseTheme = createTheme({
  defaultRadius: 'md',
  primaryShade: 8,
  components: {
    Modal: Modal.extend({
      defaultProps: { centered: true },
      styles: { title: { fontWeight: 700 } },
    }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true } }),
    HoverCard: HoverCard.extend({ defaultProps: { withArrow: true } }),
    Checkbox: Checkbox.extend({ defaultProps: { radius: '0.375rem' } }),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [primaryColor] = usePrimaryColor();
  const isDesktop = useMediaQuery('(min-width: 48em)');

  return (
    <MantineProvider
      theme={{ ...baseTheme, primaryColor }}
      defaultColorScheme="auto"
    >
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: CACHE_MAX_AGE,
          buster: import.meta.env.VITE_APP_VERSION ?? 'dev',
        }}
        onSuccess={() => {
          // reload-resume of the offline queue + blanket invalidate (ticket 09)
          void queryClient
            .resumePausedMutations()
            .then(() => queryClient.invalidateQueries());
        }}
      >
        <ModalsProvider>
          <Notifications position={isDesktop ? undefined : 'bottom-center'} />
          {children}
        </ModalsProvider>
        <ReactQueryDevtools />
      </PersistQueryClientProvider>
    </MantineProvider>
  );
}
